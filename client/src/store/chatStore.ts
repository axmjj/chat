import { create } from 'zustand';
import type { User, Message, PrivateChatReceived } from '../types';

interface ChatState {
  // 在线用户列表
  onlineUsers: number[];
  
  // 所有用户列表
  allUsers: User[];
  
  // 当前聊天对象
  currentChatUser: User | null;
  
  // 消息记录 {userId: Message[]}
  messages: Record<number, Message[]>;
  
  // WebSocket连接状态
  isConnected: boolean;
  
  // Actions
  setOnlineUsers: (users: number[]) => void;
  setAllUsers: (users: User[]) => void;
  setCurrentChatUser: (user: User | null) => void;
  addMessage: (userId: number, message: Message) => void;
  setMessages: (userId: number, messages: Message[]) => void;
  setConnected: (connected: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  onlineUsers: [],
  allUsers: [],
  currentChatUser: null,
  messages: {},
  isConnected: false,
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  setAllUsers: (users) => set({ allUsers: users }),
  
  setCurrentChatUser: (user) => set({ currentChatUser: user }),
  
  addMessage: (userId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [userId]: [...(state.messages[userId] || []), message],
    },
  })),
  
  setMessages: (userId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [userId]: messages,
    },
  })),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  clearMessages: () => set({ messages: {} }),
}));
