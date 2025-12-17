import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { LoginForm } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import Layout from '../components/Layout';
import { MessageCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: tokenData } = await authAPI.login(form);
      localStorage.setItem('token', tokenData.access_token);
      const { data: userData } = await authAPI.getCurrentUser();
      setAuth(tokenData.access_token, userData);
      navigate('/chat');
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Card className="w-full border-white/40 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">欢迎回来</CardTitle>
          <CardDescription className="text-base">
            请输入您的账号密码登录聊天室
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="用户名"
              type="text"
              placeholder="请输入用户名"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoFocus
            />
            <Input
              label="密码"
              type="password"
              placeholder="请输入密码"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              isLoading={loading}
            >
              登录
            </Button>
            <div className="text-sm text-center text-muted">
              还没有账号？{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-hover hover:underline transition-all">
                立即注册
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </Layout>
  );
}
