from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
import json
import logging
from datetime import datetime

from app.database import get_db
from app.connection import manager
from app.auth import verify_token
from app.crud import (
    create_message, 
    get_user_by_id, 
    update_user_online_status,
    get_private_messages,
    get_group_messages
)
from app.schemas import TokenData

router = APIRouter(tags=["WebSocket"])
logger = logging.getLogger(__name__)


def get_user_from_token(token: str, db: Session):
    """从Token中获取用户信息"""
    from fastapi import HTTPException
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )
    
    try:
        token_data = verify_token(token, credentials_exception)
        from app.crud import get_user_by_username
        user = get_user_by_username(db, username=token_data.username)
        if user is None:
            raise credentials_exception
        return user
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise credentials_exception


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    WebSocket连接端点
    客户端连接时需要提供token参数：ws://localhost:8000/ws?token=<your_jwt_token>
    """
    user = None
    
    try:
        # 验证Token并获取用户
        user = get_user_from_token(token, db)
        user_id = user.id
        
        # 接受连接
        await manager.connect(websocket, user_id)
        
        # 更新用户在线状态
        update_user_online_status(db, user_id, True)
        
        # 广播用户上线通知
        await manager.broadcast({
            "type": "user_status",
            "payload": {
                "user_id": user_id,
                "username": user.username,
                "status": "online",
                "timestamp": datetime.utcnow().isoformat()
            }
        }, exclude_user=user_id)
        
        # 发送在线用户列表给新连接的用户
        online_users = manager.get_online_users()
        await manager.send_personal_message({
            "type": "online_users",
            "payload": {
                "user_ids": online_users
            }
        }, user_id)
        
        # 主消息循环
        while True:
            # 接收客户端消息
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type")
                payload = message_data.get("payload", {})
                
                # 处理不同类型的消息
                if message_type == "private_chat":
                    await handle_private_chat(user_id, payload, db)
                
                elif message_type == "group_chat":
                    await handle_group_chat(user_id, payload, db)
                
                elif message_type == "ping":
                    # 心跳响应
                    await manager.send_personal_message({
                        "type": "pong",
                        "payload": {"timestamp": datetime.utcnow().isoformat()}
                    }, user_id)
                
                else:
                    # 未知消息类型
                    await manager.send_personal_message({
                        "type": "error",
                        "payload": {"message": f"Unknown message type: {message_type}"}
                    }, user_id)
            
            except json.JSONDecodeError:
                await manager.send_personal_message({
                    "type": "error",
                    "payload": {"message": "Invalid JSON format"}
                }, user_id)
            
            except Exception as e:
                logger.error(f"Error processing message from user {user_id}: {e}")
                await manager.send_personal_message({
                    "type": "error",
                    "payload": {"message": str(e)}
                }, user_id)
    
    except WebSocketDisconnect:
        if user:
            handle_disconnect(user.id, db)
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if user:
            handle_disconnect(user.id, db)


async def handle_private_chat(sender_id: int, payload: dict, db: Session):
    """处理私聊消息"""
    receiver_id = payload.get("to_user_id")
    content = payload.get("content")
    msg_type = payload.get("msg_type", "text")
    
    if not receiver_id or not content:
        await manager.send_personal_message({
            "type": "error",
            "payload": {"message": "Missing receiver_id or content"}
        }, sender_id)
        return
    
    # 保存消息到数据库
    db_message = create_message(
        db=db,
        sender_id=sender_id,
        content=content,
        receiver_id=receiver_id,
        msg_type=msg_type
    )
    
    # 获取发送者信息
    sender = get_user_by_id(db, sender_id)
    
    # 构造消息
    message_payload = {
        "type": "private_chat",
        "payload": {
            "message_id": db_message.id,
            "from_user_id": sender_id,
            "from_username": sender.username if sender else "Unknown",
            "to_user_id": receiver_id,
            "content": content,
            "msg_type": msg_type,
            "timestamp": db_message.timestamp.isoformat()
        }
    }
    
    # 发送给接收者（如果在线）
    if manager.is_user_online(receiver_id):
        await manager.send_personal_message(message_payload, receiver_id)
    
    # 发送确认给发送者
    await manager.send_personal_message({
        "type": "message_sent",
        "payload": {
            "message_id": db_message.id,
            "timestamp": db_message.timestamp.isoformat()
        }
    }, sender_id)


async def handle_group_chat(sender_id: int, payload: dict, db: Session):
    """处理群聊消息"""
    group_id = payload.get("group_id")
    content = payload.get("content")
    msg_type = payload.get("msg_type", "text")
    
    if not group_id or not content:
        await manager.send_personal_message({
            "type": "error",
            "payload": {"message": "Missing group_id or content"}
        }, sender_id)
        return
    
    # 保存消息到数据库
    db_message = create_message(
        db=db,
        sender_id=sender_id,
        content=content,
        group_id=group_id,
        msg_type=msg_type
    )
    
    # 获取发送者信息
    sender = get_user_by_id(db, sender_id)
    
    # 构造消息
    message_payload = {
        "type": "group_chat",
        "payload": {
            "message_id": db_message.id,
            "from_user_id": sender_id,
            "from_username": sender.username if sender else "Unknown",
            "group_id": group_id,
            "content": content,
            "msg_type": msg_type,
            "timestamp": db_message.timestamp.isoformat()
        }
    }
    
    # TODO: 获取群组成员列表并广播
    # 暂时广播给所有在线用户（实际应该只发给群组成员）
    await manager.broadcast(message_payload, exclude_user=sender_id)
    
    # 发送确认给发送者
    await manager.send_personal_message({
        "type": "message_sent",
        "payload": {
            "message_id": db_message.id,
            "timestamp": db_message.timestamp.isoformat()
        }
    }, sender_id)


def handle_disconnect(user_id: int, db: Session):
    """处理用户断开连接"""
    # 断开连接
    manager.disconnect(user_id)
    
    # 更新用户离线状态
    update_user_online_status(db, user_id, False)
    
    # 广播用户下线通知（使用同步方式，因为在异常处理中）
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(manager.broadcast({
                "type": "user_status",
                "payload": {
                    "user_id": user_id,
                    "status": "offline",
                    "timestamp": datetime.utcnow().isoformat()
                }
            }))
    except Exception as e:
        logger.error(f"Error broadcasting disconnect: {e}")
