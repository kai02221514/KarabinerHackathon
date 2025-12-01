import { useState } from 'react';
import Header from './Header';
import { mockUserProfiles, type Message } from '../lib/mockData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, ArrowLeft } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
}

interface EmployeeMessageDetailProps {
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  messages: Message[];
  onSendMessage: (receiverId: string, content: string) => void;
  unreadMessagesCount: number;
}

export default function EmployeeMessageDetail({ 
  user, 
  onNavigate, 
  onLogout,
  messages,
  onSendMessage,
  unreadMessagesCount
}: EmployeeMessageDetailProps) {
  const [messageInput, setMessageInput] = useState('');

  // 管理者のIDを取得
  const adminUser = mockUserProfiles.find(u => u.role === 'admin');
  const adminId = adminUser?.id || 'admin1';

  // このユーザーと管理者とのメッセージのみフィルター
  const chatMessages = messages
    .filter(msg => 
      (msg.senderId === user.id && msg.receiverId === adminId) ||
      (msg.senderId === adminId && msg.receiverId === user.id)
    )
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(adminId, messageInput.trim());
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        userName={user.name} 
        onLogout={onLogout} 
        role="employee" 
        onNavigate={onNavigate}
        currentPage="employee-message-detail"
        unreadMessagesCount={unreadMessagesCount}
      />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('employee-messages')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <div>管理者とのメッセージ</div>
            </div>
          </div>
        </div>

        {/* メッセージ履歴 */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                まだメッセージがありません
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isFromEmployee = msg.senderId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isFromEmployee ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isFromEmployee ? 'order-2' : 'order-1'}`}>
                      <div className="text-xs text-gray-500 mb-1">
                        {isFromEmployee ? '自分' : '管理者'}
                      </div>
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          isFromEmployee
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(msg.sentAt).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* メッセージ入力欄 */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力..."
                className="flex-1"
              />
              <Button 
                onClick={handleSend}
                disabled={!messageInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
