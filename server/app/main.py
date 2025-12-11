from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, users

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 创建FastAPI应用
app = FastAPI(
    title="Chat Application API",
    description="基于FastAPI的实时聊天系统后端",
    version="1.0.0"
)

# CORS配置（允许前端跨域访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应指定具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    """根路径健康检查"""
    return {"message": "Chat API is running", "status": "ok"}


@app.get("/health")
def health_check():
    """健康检查端点"""
    return {"status": "healthy"}
