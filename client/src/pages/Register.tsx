import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import type { RegisterForm } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import Layout from '../components/Layout';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState<RegisterForm>({
    username: '',
    password: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (form.password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register(form);
      navigate('/login', { state: { message: '注册成功，请登录' } });
    } catch (err: any) {
      setError(err.response?.data?.detail || '注册失败，用户名可能已存在');
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
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">创建账号</CardTitle>
          <CardDescription className="text-base">
            注册一个新账号加入聊天
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
            <Input
              label="确认密码"
              type="password"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              注册
            </Button>
            <div className="text-sm text-center text-muted">
              已有账号？{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-hover hover:underline transition-all">
                立即登录
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </Layout>
  );
}
