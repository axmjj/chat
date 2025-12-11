from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    is_online = Column(Boolean, default=False)
    
    # 关系：用户发送的消息
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    # 关系：用户接收的消息
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")


class Message(Base):
    """消息表"""
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # 私聊接收者
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)  # 群聊ID
    content = Column(Text, nullable=False)
    msg_type = Column(String(20), default="text")  # text, image, file
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # 关系
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
    group = relationship("Group", back_populates="messages")


class Group(Base):
    """群组表"""
    __tablename__ = "groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    messages = relationship("Message", back_populates="group")
    members = relationship("GroupMember", back_populates="group")


class GroupMember(Base):
    """群组成员表"""
    __tablename__ = "group_members"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    group = relationship("Group", back_populates="members")
