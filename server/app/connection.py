from fastapi import WebSocket
from typing import Dict, List, Set
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """WebSocket连接管理器"""
    
    def __init__(self):
        # 存储活跃连接：{user_id: WebSocket}
        self.active_connections: Dict[int, WebSocket] = {}
        # 存储在线用户ID集合
        self.online_users: Set[int] = set()
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """接受WebSocket连接并记录用户"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.online_users.add(user_id)
        logger.info(f"User {user_id} connected. Total online: {len(self.online_users)}")
    
    def disconnect(self, user_id: int):
        """断开连接并移除用户"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.online_users:
            self.online_users.remove(user_id)
        logger.info(f"User {user_id} disconnected. Total online: {len(self.online_users)}")
    
    async def send_personal_message(self, message: dict, user_id: int):
        """向指定用户发送消息"""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                self.disconnect(user_id)
    
    async def broadcast(self, message: dict, exclude_user: int = None):
        """广播消息给所有在线用户（可排除指定用户）"""
        disconnected_users = []
        
        for user_id, websocket in self.active_connections.items():
            if exclude_user and user_id == exclude_user:
                continue
            
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to user {user_id}: {e}")
                disconnected_users.append(user_id)
        
        # 清理断开的连接
        for user_id in disconnected_users:
            self.disconnect(user_id)
    
    async def broadcast_to_group(self, message: dict, user_ids: List[int]):
        """向指定的用户组广播消息（用于群聊）"""
        disconnected_users = []
        
        for user_id in user_ids:
            if user_id in self.active_connections:
                websocket = self.active_connections[user_id]
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending to user {user_id} in group: {e}")
                    disconnected_users.append(user_id)
        
        # 清理断开的连接
        for user_id in disconnected_users:
            self.disconnect(user_id)
    
    def get_online_users(self) -> List[int]:
        """获取所有在线用户ID列表"""
        return list(self.online_users)
    
    def is_user_online(self, user_id: int) -> bool:
        """检查用户是否在线"""
        return user_id in self.online_users


# 创建全局连接管理器实例
manager = ConnectionManager()
