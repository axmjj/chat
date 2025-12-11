# 基于软件开发的聊天软件的设计与实现 - 开发文档

## 1. 引言

### 1.1 项目背景
随着互联网技术的飞速发展，即时通讯（IM）已成为人们日常生活中不可或缺的一部分。本项目旨在设计并实现一个基于C/S架构的实时聊天软件，通过Socket编程（WebSocket）实现网络通信，提供私聊、群聊、用户列表等基本功能，并注重用户体验与界面美化。

### 1.2 项目目标
*   构建稳定可靠的C/S架构聊天系统。
*   实现基于WebSocket的实时双向通信。
*   提供用户注册、登录、鉴权功能。
*   实现单人私聊和多人群聊功能。
*   设计美观、易用的图形用户界面（GUI）。

## 2. 系统总体设计

### 2.1 系统架构
本系统采用经典的 **C/S (Client/Server)** 架构。
*   **服务端 (Server)**: 负责处理业务逻辑、消息转发、用户鉴权、数据持久化。
*   **客户端 (Client)**: 负责用户交互、界面展示、与服务器建立连接并收发消息。

### 2.2 技术选型

#### 2.2.1 服务端
*   **编程语言**: Python 3.10+
*   **Web框架**: FastAPI (高性能，支持异步，原生支持WebSocket)
*   **数据库**: SQLite (轻量级，无需配置，适合毕设及中小型应用)
*   **ORM**: SQLAlchemy 或 Tortoise-ORM (用于数据库操作)
*   **并发处理**: Python `asyncio` (异步IO) 处理高并发连接

#### 2.2.2 客户端
*   **框架**: React 18+
*   **语言**: TypeScript (提供类型安全，增强代码健壮性)
*   **构建工具**: Vite (快速构建)
*   **UI组件库**: Ant Design 或 Material UI (用于美化界面)
*   **状态管理**: Zustand 或 React Context
*   **网络通信**: 原生 `WebSocket` API + `Axios` (HTTP请求)

## 3. 数据库设计

使用 SQLite 存储用户信息和聊天记录。主要包含以下数据表：

### 3.1 用户表 (users)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | INTEGER | 主键，自增 |
| username | VARCHAR | 用户名 (唯一) |
| password_hash | VARCHAR | 密码哈希值 |
| avatar_url | VARCHAR | 头像链接 |
| created_at | DATETIME | 创建时间 |
| is_online | BOOLEAN | 在线状态 |

### 3.2 消息表 (messages)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | INTEGER | 主键，自增 |
| sender_id | INTEGER | 发送者ID (外键 -> users.id) |
| receiver_id | INTEGER | 接收者ID (外键 -> users.id, 私聊时使用) |
| group_id | INTEGER | 群组ID (外键 -> groups.id, 群聊时使用) |
| content | TEXT | 消息内容 |
| msg_type | VARCHAR | 消息类型 (text, image, file) |
| timestamp | DATETIME | 发送时间 |

### 3.3 群组表 (groups)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | INTEGER | 主键，自增 |
| name | VARCHAR | 群组名称 |
| owner_id | INTEGER | 群主ID |

### 3.4 群组成员表 (group_members)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| group_id | INTEGER | 群组ID |
| user_id | INTEGER | 用户ID |

## 4. 通信协议设计

系统使用 WebSocket 进行实时通信。

### 4.1 消息格式 (JSON)
所有 WebSocket 消息均采用 JSON 格式传输。

**基本结构:**
```json
{
  "type": "message_type",
  "payload": { ... }
}
```

### 4.2 消息类型定义

*   **鉴权 (AUTH)**
    *   客户端发送: `{ "type": "auth", "token": "jwt_token" }`
*   **私聊消息 (PRIVATE_CHAT)**
    *   客户端发送: `{ "type": "private_chat", "to_user_id": 1, "content": "Hello" }`
    *   服务端转发: `{ "type": "private_chat", "from_user_id": 2, "content": "Hello", "timestamp": "..." }`
*   **群聊消息 (GROUP_CHAT)**
    *   客户端发送: `{ "type": "group_chat", "group_id": 101, "content": "Hi all" }`
*   **用户上线/下线通知 (USER_STATUS)**
    *   服务端广播: `{ "type": "user_status", "user_id": 1, "status": "online" }`
*   **错误消息 (ERROR)**
    *   服务端发送: `{ "type": "error", "message": "Invalid token" }`

## 5. 模块详细设计

### 5.1 服务端 (Python + FastAPI)

#### 5.1.1 目录结构
```
server/
├── app/
│   ├── main.py          # 入口文件
│   ├── models.py        # 数据库模型
│   ├── schemas.py       # Pydantic模型 (数据验证)
│   ├── crud.py          # 数据库操作
│   ├── database.py      # 数据库连接
│   ├── auth.py          # JWT鉴权逻辑
│   ├── connection.py    # WebSocket连接管理器
│   └── routers/
│       ├── auth.py      # 登录/注册接口
│       ├── users.py     # 用户相关接口
│       └── chat.py      # WebSocket路由
├── requirements.txt
└── .env
```

#### 5.1.2 核心功能实现
*   **ConnectionManager**: 维护活跃的 WebSocket 连接列表 (`List[WebSocket]`)。支持 `connect`, `disconnect`, `send_personal_message`, `broadcast` 等方法。
*   **JWT 鉴权**: 用户登录成功后颁发 JWT Token。WebSocket 连接建立时，通过 Query Parameter 或初始握手消息验证 Token 有效性。

### 5.2 客户端 (React + TS)

#### 5.2.1 目录结构
```
client/
├── src/
│   ├── components/      # 通用组件 (ChatBubble, UserList)
│   ├── pages/           # 页面 (Login, Register, ChatRoom)
│   ├── services/        # API请求 & WebSocket服务
│   ├── store/           # 状态管理 (useAuthStore, useChatStore)
│   ├── types/           # TypeScript类型定义
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── tsconfig.json
```

#### 5.2.2 核心功能实现
*   **WebSocket Context/Hook**: 封装 WebSocket 连接逻辑，处理断线重连、消息分发。
*   **状态管理**: 使用 Zustand 管理当前登录用户、在线用户列表、聊天记录（按会话ID存储）。
*   **UI设计**:
    *   左侧：侧边栏（个人信息、联系人列表/群组列表）。
    *   右侧：聊天窗口（消息展示区域、输入框）。

## 6. 开发计划

1.  **环境搭建**: 初始化 Python 虚拟环境和 React 项目。
2.  **后端基础**: 配置 SQLite，实现用户注册/登录 API (JWT)。
3.  **前端基础**: 搭建登录/注册页面，实现与后端 API 对接。
4.  **WebSocket 通信**:
    *   后端实现 ConnectionManager。
    *   前端实现 WebSocket 连接与鉴权。
5.  **聊天功能**:
    *   实现私聊消息的发送与接收。
    *   实现群聊功能。
    *   消息持久化到数据库。
6.  **界面优化**: 美化 UI，增加消息气泡、时间戳、头像等细节。
7.  **测试与部署**: 功能测试，修复 Bug。

## 7. 运行说明

### 7.1 服务端
```bash
cd server
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 7.2 客户端
```bash
cd client
npm install
npm run dev
```
