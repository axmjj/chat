import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useWebSocket } from '../services/websocket';
import { userAPI } from '../services/api';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';

export default function ChatRoom() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { allUsers, setAllUsers } = useChatStore();
  const { isConnected } = useWebSocket();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      const { data } = await userAPI.getUsers();
      setAllUsers(data.filter(u => u.id !== user?.id));
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">加载中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <div className="h-screen w-full bg-background p-4 md:p-6 flex items-center justify-center overflow-hidden">
      <Card className="w-full max-w-6xl h-[90vh] flex overflow-hidden border-white/20 shadow-2xl bg-surface/90 backdrop-blur-2xl">
        <ChatSidebar 
          users={allUsers}
          currentUser={user} 
          onLogout={handleLogout} 
          isConnected={isConnected} 
        />
        <ChatWindow />
      </Card>
    </div>
  );
}
