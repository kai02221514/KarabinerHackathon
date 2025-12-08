import { useState } from 'react';
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
import { 
  type MyApplicationItem, 
  type Message, 
  type Application,
  type UserProfile,
  mockApplications,
  mockMyApplicationItems,
  mockMessages,
  mockUserProfiles
} from './lib/mockData';
import { toast, Toaster } from 'sonner';

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
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [users, setUsers] = useState<UserProfile[]>(mockUserProfiles);

  const handleLogin = (email: string, password: string) => {
    // モック認証：登録済みユーザーから検索
    const user = users.find(u => u.email === email);
    
    if (user) {
      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
      setCurrentPage(user.role === 'admin' ? 'admin-home' : 'employee-home');
      toast.success('ログインしました');
    } else {
      toast.error('メールアドレスまたはパスワードが正しくありません');
    }
  };

  const handleSignup = (name: string, email: string, password: string, role: UserRole) => {
    // モック認証：新規ユーザーを追加
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      role
    };
    
    setUsers(prev => [...prev, newUser]);
    setCurrentUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
    setCurrentPage(role === 'admin' ? 'admin-home' : 'employee-home');
    toast.success('アカウントを作成しました');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    toast.success('ログアウトしました');
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
      id: `item-${Date.now()}`,
      applicationId,
      userId: currentUser.id,
      title,
      memo,
      isCompleted: false,
      addedAt: new Date().toISOString(),
      completedAt: null
    };
    
    setMyApplicationItems(prev => [newItem, ...prev]);
    toast.success('マイ申請に追加しました');
  };

  const updateMyApplications = (items: MyApplicationItem[]) => {
    setMyApplicationItems(items);
  };

  const deleteMyApplication = (itemId: string) => {
    setMyApplicationItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('マイ申請から削除しました');
  };

  const saveApplication = (formData: Omit<Application, 'id'>, formId: string | null) => {
    if (formId) {
      // 既存フォームの更新
      setApplications(prev => prev.map(app => 
        app.id === formId ? { ...formData, id: formId } : app
      ));
      toast.success('申請フォームを更新しました');
    } else {
      // 新規フォームの追加
      const newApplication: Application = {
        ...formData,
        id: `app-${Date.now()}`
      };
      setApplications(prev => [...prev, newApplication]);
      toast.success('申請フォームを作成しました');
    }
    navigateTo('admin-forms');
  };

  const viewUserChat = (userId: string, userName: string, userEmail: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSelectedUserEmail(userEmail);
    setCurrentPage('admin-user-chat');
  };

  const sendMessage = (receiverId: string, content: string) => {
    if (!currentUser) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      content,
      sentAt: new Date().toISOString(),
      isRead: false
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const markMessagesAsRead = (messageIds: string[]) => {
    setMessages(prev => prev.map(msg => 
      messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
    ));
  };

  // 未読メッセージ数を取得
  const getUnreadMessagesCount = () => {
    if (!currentUser) return 0;
    return messages.filter(msg => msg.receiverId === currentUser.id && !msg.isRead).length;
  };

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
          return <EmployeeMyApplications applications={applications} user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} onViewDetail={viewApplicationDetail} items={myApplicationItems} onAddToMyApplications={addToMyApplications} onUpdateMyApplications={updateMyApplications} onDeleteMyApplication={deleteMyApplication} unreadMessagesCount={unreadCount} />;
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
          return <AdminUserList user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} onViewUserChat={viewUserChat} messages={messages} />;
        case 'admin-user-chat':
          return <AdminUserChat targetUserId={selectedUserId || ''} targetUserName={selectedUserName} targetUserEmail={selectedUserEmail} user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} messages={messages} onSendMessage={sendMessage} />;
        default:
          return <AdminHome applications={applications} user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} onEditForm={editForm} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
      <Toaster />
    </div>
  );
}
