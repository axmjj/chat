from sqlalchemy.orm import Session
from app.models import User, Message, Group, GroupMember
from passlib.context import CryptContext
from typing import List, Optional
from datetime import datetime

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ========== 用户操作 ==========
def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """根据用户名获取用户"""
    return db.query(User).filter(User.username == username).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """根据ID获取用户"""
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, username: str, password: str) -> User:
    """创建新用户"""
    hashed_password = pwd_context.hash(password)
    db_user = User(
        username=username,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """验证用户登录"""
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def update_user_online_status(db: Session, user_id: int, is_online: bool):
    """更新用户在线状态"""
    user = get_user_by_id(db, user_id)
    if user:
        user.is_online = is_online
        db.commit()

def get_all_users(db: Session) -> List[User]:
    """获取所有用户"""
    return db.query(User).all()


# ========== 消息操作 ==========
def create_message(
    db: Session, 
    sender_id: int, 
    content: str,
    receiver_id: Optional[int] = None,
    group_id: Optional[int] = None,
    msg_type: str = "text"
) -> Message:
    """创建消息"""
    db_message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        group_id=group_id,
        content=content,
        msg_type=msg_type
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_private_messages(db: Session, user1_id: int, user2_id: int, limit: int = 50) -> List[Message]:
    """获取两个用户之间的私聊历史"""
    return db.query(Message).filter(
        ((Message.sender_id == user1_id) & (Message.receiver_id == user2_id)) |
        ((Message.sender_id == user2_id) & (Message.receiver_id == user1_id))
    ).order_by(Message.timestamp.desc()).limit(limit).all()

def get_group_messages(db: Session, group_id: int, limit: int = 50) -> List[Message]:
    """获取群组消息历史"""
    return db.query(Message).filter(
        Message.group_id == group_id
    ).order_by(Message.timestamp.desc()).limit(limit).all()


# ========== 群组操作 ==========
def create_group(db: Session, name: str, owner_id: int) -> Group:
    """创建群组"""
    db_group = Group(name=name, owner_id=owner_id)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def add_group_member(db: Session, group_id: int, user_id: int):
    """添加群组成员"""
    member = GroupMember(group_id=group_id, user_id=user_id)
    db.add(member)
    db.commit()
