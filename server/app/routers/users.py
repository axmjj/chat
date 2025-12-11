from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import UserResponse, MessageResponse
from app.crud import get_all_users, get_private_messages
from app.auth import get_current_user

router = APIRouter(prefix="/users", tags=["用户"])


@router.get("/", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """获取所有用户列表"""
    users = get_all_users(db)
    return users


@router.get("/messages/{other_user_id}", response_model=List[MessageResponse])
def get_chat_history(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """获取与指定用户的聊天历史"""
    messages = get_private_messages(db, current_user.id, other_user_id)
    # 反转顺序，使其按时间升序
    return list(reversed(messages))
