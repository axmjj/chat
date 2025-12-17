import type { User } from '../types';
import { useChatStore } from '../store/chatStore';
import { LogOut, User as UserIcon, Circle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

interface ChatSidebarProps {
  users: User[];
  currentUser: User | null;
  onLogout: () => void;
  isConnected: boolean;
}

export default function ChatSidebar({ users, currentUser, onLogout, isConnected }: ChatSidebarProps) {
  const { currentChatUser, setCurrentChatUser, onlineUsers } = useChatStore();

  return (
    <div className="w-80 border-r border-white/10 bg-surface/50 flex flex-col h-full">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
            {currentUser?.username[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{currentUser?.username}</h3>
            <div className="flex items-center text-xs text-muted">
              <Circle className={cn("w-2 h-2 mr-1 fill-current", isConnected ? "text-green-500" : "text-red-500")} />
              {isConnected ? '已连接' : '未连接'}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} title="退出登录" className="p-2 h-auto">
          <LogOut className="w-5 h-5 text-muted hover:text-red-500 transition-colors" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="px-2 py-1 text-xs font-medium text-muted uppercase tracking-wider flex justify-between">
          <span>联系人</span>
          <span>{onlineUsers.length} 在线</span>
        </div>

        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => setCurrentChatUser(user)}
            className={cn(
              "w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200",
              currentChatUser?.id === user.id 
                ? "bg-primary/10 text-primary shadow-sm" 
                : "hover:bg-white/50 text-foreground/80 hover:text-foreground"
            )}
          >
            <div className="relative">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                currentChatUser?.id === user.id ? "bg-primary text-white" : "bg-muted-light text-muted"
              )}>
                {user.username[0].toUpperCase()}
              </div>
              {onlineUsers.includes(user.id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">{user.username}</div>
              <div className="text-xs text-muted truncate">
                {onlineUsers.includes(user.id) ? '在线' : '离线'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
