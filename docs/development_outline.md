# 开发大纲

## 1. 项目初始化
- [x] 创建项目根目录 `chat`
- [x] 创建 `server` 文件夹 (后端)
- [x] 创建 `client` 文件夹 (前端)

## 2. 服务器端开发 (server/)
**技术栈**: Python 3.10+, FastAPI, SQLite, WebSockets, SQLAlchemy

### 第一阶段：基础架构搭建
- [x] **环境配置**
    - [x] 创建 Python 虚拟环境 (`python -m venv venv`)
    - [x] 创建 `requirements.txt` 并安装依赖 (`fastapi`, `uvicorn`, `sqlalchemy`, `python-jose`, `passlib`, `python-multipart`)
- [x] **项目结构**
    - [x] 创建 `app/` 核心目录
    - [x] 创建 `app/main.py` (应用入口)
    - [x] 创建 `app/database.py` (数据库连接)

### 第二阶段：数据库与鉴权
- [x] **数据库设计 (`app/models.py`)**
    - [x] 定义 `User` 模型 (id, username, password_hash, avatar)
    - [x] 定义 `Message` 模型 (id, sender_id, receiver_id, content, timestamp)
    - [x] 定义 `Group` 相关模型 (可选，视进度而定)
- [x] **数据操作层 (`app/crud.py`)**
    - [x] 实现用户创建、查询
    - [x] 实现消息存储、历史记录查询
- [x] **用户认证 (`app/auth.py`, `app/routers/auth.py`)**
    - [x] 实现密码加密与校验 (`passlib`)
    - [x] 实现 JWT Token 生成与解析
    - [x] 实现 注册/登录 API 接口

### 第三阶段：WebSocket 通信核心
- [ ] **连接管理器 (`app/connection.py`)**
    - [ ] 实现 `ConnectionManager` 类
    - [ ] 管理活跃连接池 (`active_connections`)
    - [ ] 实现点对点发送 (`send_personal_message`)
    - [ ] 实现广播发送 (`broadcast`)
- [ ] **WebSocket 路由 (`app/routers/chat.py`)**
    - [ ] 定义 WebSocket 端点 (`/ws/{user_id}`)
    - [ ] WebSocket 鉴权 (Token 验证)
    - [ ] 消息分发逻辑 (解析 JSON -> 存储 -> 转发)

### 第四阶段：API 完善
- [ ] **用户接口**
    - [ ] 获取用户列表 API
    - [ ] 获取当前用户信息 API
- [ ] **消息接口**
    - [ ] 获取历史聊天记录 API

## 3. 客户端开发 (client/)
**技术栈**: React 18+, TypeScript, Vite, Zustand (状态管理), Ant Design / TailwindCSS

### 第一阶段：脚手架与基础UI
- [ ] **项目初始化**
    - [ ] 使用 Vite 创建 React+TS 项目
    - [ ] 安装依赖 (`axios`, `react-router-dom`, `zustand`, `clsx`, UI库)
- [ ] **路由配置**
    - [ ] 配置 React Router (`/login`, `/register`, `/chat`)
- [ ] **认证页面**
    - [ ] 开发登录页面 (Login Page)
    - [ ] 开发注册页面 (Register Page)
    - [ ] 实现 API 请求服务 (`services/api.ts`)

### 第二阶段：聊天界面布局
- [ ] **主布局 (Layout)**
    - [ ] 侧边栏 (Sidebar): 用户头像、导航
    - [ ] 联系人列表 (ContactList): 显示所有用户/在线用户
    - [ ] 聊天主窗口 (ChatWindow): 顶部栏、消息区域、输入框
- [ ] **UI 组件**
    - [ ] `MessageBubble`: 消息气泡组件 (区分自己/他人)
    - [ ] `ChatInput`: 消息输入组件

### 第三阶段：WebSocket 集成与状态管理
- [ ] **状态管理 (Store)**
    - [ ] `useAuthStore`: 存储用户信息、Token
    - [ ] `useChatStore`: 存储当前聊天对象、消息列表、在线用户
- [ ] **WebSocket 服务 (`services/socket.ts`)**
    - [ ] 封装 WebSocket 连接、断开、重连逻辑
    - [ ] 监听 `onmessage` 并更新 Store
- [ ] **业务逻辑联调**
    - [ ] 发送消息 -> 更新本地 UI -> 发送 WS 请求
    - [ ] 接收消息 -> 判断来源 -> 更新对应会话的消息列表

### 第四阶段：优化与美化
- [ ] **体验优化**
    - [ ] 消息列表自动滚动到底部
    - [ ] 登录状态持久化
- [ ] **界面美化**
    - [ ] 调整配色、间距、字体
    - [ ] 添加加载动画

## 4. 部署与测试
- [ ] 启动服务端 (`uvicorn`)
- [ ] 启动客户端 (`npm run dev`)
- [ ] 联合测试：注册两个账号，互发消息测试
