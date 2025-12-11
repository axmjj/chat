# Chat Application - 服务端

## 运行指南

### 1. 创建虚拟环境
```bash
python -m venv venv
```

### 2. 激活虚拟环境
**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
.\venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. 安装依赖
```bash
pip install -r requirements.txt
```

### 4. 配置环境变量
复制 `.env.example` 为 `.env` 并修改配置：
```bash
cp .env.example .env
```

### 5. 启动服务
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. 访问API文档
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构
```
server/
├── app/
│   ├── __init__.py
│   ├── main.py          # 应用入口
│   ├── database.py      # 数据库配置
│   ├── models.py        # 数据模型
│   ├── schemas.py       # Pydantic数据验证
│   ├── crud.py          # 数据库操作
│   ├── auth.py          # JWT认证
│   └── routers/
│       ├── __init__.py
│       ├── auth.py      # 认证路由
│       └── users.py     # 用户路由
├── requirements.txt
├── .env.example
└── README.md
```

## API端点

### 认证相关
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/token` - 获取访问令牌（OAuth2格式）
- `GET /auth/me` - 获取当前用户信息

### 用户相关
- `GET /users/` - 获取用户列表
- `GET /users/messages/{other_user_id}` - 获取聊天历史

## 开发进度
- [x] 基础架构搭建
- [x] 数据库模型设计
- [x] 用户注册与登录
- [x] JWT认证
- [x] 用户列表API
- [x] 历史消息API
- [ ] WebSocket通信（待开发）
- [ ] 群聊功能（待开发）
