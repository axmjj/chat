import axios from 'axios';
import type { LoginForm, RegisterForm, TokenResponse, User, Message } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  // 注册
  register: (data: RegisterForm) => 
    api.post<User>('/auth/register', data),
  
  // 登录
  login: (data: LoginForm) => 
    api.post<TokenResponse>('/auth/login', data),
  
  // 获取当前用户信息
  getCurrentUser: () => 
    api.get<User>('/auth/me'),
};

// 用户相关API
export const userAPI = {
  // 获取所有用户列表
  getUsers: () => 
    api.get<User[]>('/users/'),
  
  // 获取聊天历史
  getChatHistory: (otherUserId: number) => 
    api.get<Message[]>(`/users/messages/${otherUserId}`),
};

export default api;
