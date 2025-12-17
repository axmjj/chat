import { useState, useEffect, useRef, FormEvent } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '../services/websocket';
import { userAPI } from '../services/api';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWindow() {
  const { currentChatUser, messages, setMessages, addMessage } = useChatStore();
  const { user } = useAuthStore();
  const { sendMessage, isConnected } = useWebSocket();
  
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentChatUser) {
      loadChatHistory();
    }
  }, [currentChatUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentChatUser]);

  const loadChatHistory = async () => {
    if (!currentChatUser) return;
    
    setLoading(true);
    try {
      const { data } = await userAPI.getChatHistory(currentChatUser.id);
      setMessages(currentChatUser.id, data);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || !currentChatUser || !user) return;

    const messageContent = inputText.trim();
    
    // 发送消息，使用正确的格式
    sendMessage({
      type: 'private_chat',
      payload: {
        to_user_id: currentChatUser.id,
        content: messageContent,
        msg_type: 'text'
      }
    });

    // 本地立即显示
    addMessage(currentChatUser.id, {
      id: Date.now(), // 临时ID
      sender_id: user.id,
      receiver_id: currentChatUser.id,
      content: messageContent,
      msg_type: 'text',
      timestamp: new Date().toISOString(),
    });

    setInputText('');
  };

  if (!currentChatUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface/30 text-muted p-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">开始聊天</h3>
        <p className="max-w-xs">选择左侧联系人开始发送消息</p>
      </div>
    );
  }

  const currentMessages = messages[currentChatUser.id] || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-surface/30">
      <div className="p-4 border-b border-white/10 bg-surface/50 backdrop-blur-sm flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {currentChatUser.username[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{currentChatUser.username}</h3>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {currentMessages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex w-full",
                    isMe ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed break-words",
                      isMe 
                        ? "bg-primary text-primary-foreground rounded-br-none" 
                        : "bg-white text-foreground rounded-bl-none"
                    )}
                  >
                    {msg.content}
                    <div className={cn(
                      "text-[10px] mt-1 opacity-70 text-right",
                      isMe ? "text-primary-foreground" : "text-muted"
                    )}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surface/50 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 bg-white/80 border-white/20 focus:bg-white"
            disabled={!isConnected}
          />
          <Button 
            type="submit" 
            size="md" 
            disabled={!inputText.trim() || !isConnected}
            className="rounded-xl px-4"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
