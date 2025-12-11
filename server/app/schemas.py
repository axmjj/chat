from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ========== 用户相关Schema ==========
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    avatar_url: str
    created_at: datetime
    is_online: bool
    
    class Config:
        from_attributes = True


# ========== Token Schema ==========
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# ========== 消息相关Schema ==========
class MessageCreate(BaseModel):
    receiver_id: Optional[int] = None
    group_id: Optional[int] = None
    content: str
    msg_type: str = "text"

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: Optional[int]
    group_id: Optional[int]
    content: str
    msg_type: str
    timestamp: datetime
    
    class Config:
        from_attributes = True


# ========== WebSocket消息Schema ==========
class WSMessage(BaseModel):
    type: str  # auth, private_chat, group_chat, user_status, error
    payload: dict
