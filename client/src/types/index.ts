// 用户相关类型
export interface User {
  id: number;
  username: string;
  avatar_url: string;
  created_at: string;
  is_online: boolean;
}

// 登录注册表单
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  password: string;
}

// Token响应
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// 消息类型
export interface Message {
  id: number;
  sender_id: number;
  receiver_id?: number;
  group_id?: number;
  content: string;
  msg_type: string;
  timestamp: string;
}

// WebSocket消息类型
export type WSMessageType = 
  | 'auth'
  | 'private_chat'
  | 'group_chat'
  | 'user_status'
  | 'online_users'
  | 'message_sent'
  | 'error'
  | 'ping'
  | 'pong';

export interface WSMessage {
  type: WSMessageType;
  payload: any;
}

// 私聊消息payload
export interface PrivateChatPayload {
  to_user_id: number;
  content: string;
  msg_type?: string;
}

// 接收到的私聊消息
export interface PrivateChatReceived {
  message_id: number;
  from_user_id: number;
  from_username: string;
  to_user_id: number;
  content: string;
  msg_type: string;
  timestamp: string;
}

// 用户状态变更
export interface UserStatusPayload {
  user_id: number;
  username?: string;
  status: 'online' | 'offline';
  timestamp: string;
}
