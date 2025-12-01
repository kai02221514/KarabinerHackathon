import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import EmployeeHome from './components/EmployeeHome';
import EmployeeApplicationList from './components/EmployeeApplicationList';
import EmployeeApplicationDetail from './components/EmployeeApplicationDetail';
import EmployeeMyApplications from './components/EmployeeMyApplications';
import EmployeeMessages from './components/EmployeeMessages';
import EmployeeMessageDetail from './components/EmployeeMessageDetail';
import AdminHome from './components/AdminHome';
import AdminFormManagement from './components/AdminFormManagement';
import AdminFormEditor from './components/AdminFormEditor';
import AdminUserList from './components/AdminUserList';
import AdminUserChat from './components/AdminUserChat';
import { mockMyApplicationItems, mockMessages, mockApplications, type MyApplicationItem, type Message, type Application } from './lib/mockData';

type UserRole = 'employee' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

type Page = 
  | 'login' 
  | 'signup' 
  | 'employee-home' 
  | 'employee-applications' 
  | 'employee-application-detail'
  | 'employee-my-applications'
  | 'employee-messages'
  | 'employee-message-detail'
  | 'admin-home'
  | 'admin-forms'
  | 'admin-form-editor'
  | 'admin-users'
  | 'admin-user-chat';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [myApplicationItems, setMyApplicationItems] = useState<MyApplicationItem[]>(mockMyApplicationItems);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>(mockApplications);

  const handleLogin = (email: string, password: string) => {
    // モックログイン処理
    // 実際のアプリではSupabaseで認証を行う
    const mockUser: User = {
      id: '1',
      name: '山田太郎',
      email: email,
      role: email.includes('admin') ? 'admin' : 'employee'
    };
    setCurrentUser(mockUser);
    setCurrentPage(mockUser.role === 'admin' ? 'admin-home' : 'employee-home');
  };

  const handleSignup = (name: string, email: string, password: string, role: UserRole) => {
    // モック登録処理
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role
    };
    setCurrentUser(newUser);
    setCurrentPage(role === 'admin' ? 'admin-home' : 'employee-home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const viewApplicationDetail = (id: string) => {
    setSelectedApplicationId(id);
    setCurrentPage('employee-application-detail');
  };

  const editForm = (id: string | null) => {
    setEditingFormId(id);
    setCurrentPage('admin-form-editor');
  };

  const addToMyApplications = (applicationId: string, title: string, memo: string) => {
    if (!currentUser) return;
    
    const newItem: MyApplicationItem = {
      id: Date.now().toString(),
      applicationId,
      userId: currentUser.id,
      title,
      memo,
      isCompleted: false,
      addedAt: new Date().toISOString(),
      completedAt: null
    };
    
    setMyApplicationItems(prev => [newItem, ...prev]);
  };

  const updateMyApplications = (items: MyApplicationItem[]) => {
    setMyApplicationItems(items);
  };

  const saveApplication = (formData: Omit<Application, 'id'>, formId: string | null) => {
    if (formId) {
      // 既存フォームの更新
      setApplications(prev => prev.map(app => 
        app.id === formId 
          ? { ...app, ...formData }
          : app
      ));
    } else {
      // 新規フォームの追加
      const newApplication: Application = {
        id: Date.now().toString(),
        ...formData
      };
      setApplications(prev => [...prev, newApplication]);
    }
  };

  const viewUserChat = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentPage('admin-user-chat');
  };

  const sendMessage = (receiverId: string, content: string) => {
    if (!currentUser) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId,
      content,
      sentAt: new Date().toISOString(),
      isRead: false
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const markMessagesAsRead = (senderId: string) => {
    if (!currentUser) return;
    
    setMessages(prev => prev.map(msg => {
      if (msg.senderId === senderId && msg.receiverId === currentUser.id && !msg.isRead) {
        return { ...msg, isRead: true };
      }
      return msg;
    }));
  };

  // 未読メッセージ数を取得
  const getUnreadMessagesCount = () => {
    if (!currentUser) return 0;
    return messages.filter(msg => msg.receiverId === currentUser.id && !msg.isRead).length;
  };

  // メッセージを既読にするエフェクト
  useEffect(() => {
    if (!currentUser) return;
    
    if (currentPage === 'employee-messages' || currentPage === 'employee-message-detail') {
      // 管理者からのメッセージを既読にする
      const hasUnreadFromAdmin = messages.some(
        msg => msg.senderId === 'admin1' && msg.receiverId === currentUser.id && !msg.isRead
      );
      
      if (hasUnreadFromAdmin) {
        setMessages(prev => prev.map(msg => {
          if (msg.senderId === 'admin1' && msg.receiverId === currentUser.id && !msg.isRead) {
            return { ...msg, isRead: true };
          }
          return msg;
        }));
      }
    } else if (currentPage === 'admin-user-chat' && selectedUserId) {
      // 選択されたユーザーからのメッセージを既読にする
      const hasUnreadFromUser = messages.some(
        msg => msg.senderId === selectedUserId && msg.receiverId === currentUser.id && !msg.isRead
      );
      
      if (hasUnreadFromUser) {
        setMessages(prev => prev.map(msg => {
          if (msg.senderId === selectedUserId && msg.receiverId === currentUser.id && !msg.isRead) {
            return { ...msg, isRead: true };
          }
          return msg;
        }));
      }
    }
  }, [currentPage, selectedUserId, currentUser]);

  const renderPage = () => {
    if (!currentUser) {
      switch (currentPage) {
        case 'signup':
          return <SignupPage onSignup={handleSignup} onBackToLogin={() => navigateTo('login')} />;
        default:
          return <LoginPage onLogin={handleLogin} onSignup={() => navigateTo('signup')} />;
      }
    }

    const unreadCount = getUnreadMessagesCount();

    // 社員用画面
    if (currentUser.role === 'employee') {
      switch (currentPage) {
        case 'employee-applications':
          return <EmployeeApplicationList applications={applications} onViewDetail={viewApplicationDetail} user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} unreadMessagesCount={unreadCount} />;
        case 'employee-application-detail':
          return <EmployeeApplicationDetail applications={applications} applicationId={selectedApplicationId} user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} onAddToMyApplications={addToMyApplications} unreadMessagesCount={unreadCount} />;
        case 'employee-my-applications':
          return <EmployeeMyApplications applications={applications} user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} onViewDetail={viewApplicationDetail} items={myApplicationItems} onAddToMyApplications={addToMyApplications} onUpdateMyApplications={updateMyApplications} unreadMessagesCount={unreadCount} />;
        case 'employee-messages':
          return <EmployeeMessages user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} onViewMessageDetail={() => navigateTo('employee-message-detail')} messages={messages} unreadMessagesCount={unreadCount} />;
        case 'employee-message-detail':
          return <EmployeeMessageDetail user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} messages={messages} onSendMessage={sendMessage} unreadMessagesCount={unreadCount} />;
        default:
          return <EmployeeHome applications={applications} onViewDetail={viewApplicationDetail} user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} myApplicationItems={myApplicationItems} unreadMessagesCount={unreadCount} />;
      }
    }

    // アドミン用画面
    if (currentUser.role === 'admin') {
      switch (currentPage) {
        case 'admin-forms':
          return <AdminFormManagement applications={applications} user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} onEditForm={editForm} />;
        case 'admin-form-editor':
          return <AdminFormEditor applications={applications} formId={editingFormId} user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} onSaveForm={saveApplication} />;
        case 'admin-users':
          return <AdminUserList user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} onViewUserChat={viewUserChat} />;
        case 'admin-user-chat':
          return <AdminUserChat targetUserId={selectedUserId || ''} user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} messages={messages} onSendMessage={sendMessage} />;
        default:
          return <AdminHome applications={applications} user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} onEditForm={editForm} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
    </div>
  );
}