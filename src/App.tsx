import { useState, useEffect, useRef } from "react";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import EmployeeHome from "./components/EmployeeHome";
import EmployeeApplicationList from "./components/EmployeeApplicationList";
import EmployeeApplicationDetail from "./components/EmployeeApplicationDetail";
import EmployeeMyApplications from "./components/EmployeeMyApplications";
import EmployeeMessages from "./components/EmployeeMessages";
import EmployeeMessageDetail from "./components/EmployeeMessageDetail";
import AdminHome from "./components/AdminHome";
import AdminFormManagement from "./components/AdminFormManagement";
import AdminFormEditor from "./components/AdminFormEditor";
import AdminUserList from "./components/AdminUserList";
import AdminUserChat from "./components/AdminUserChat";
import {
  type MyApplicationItem,
  type Message,
  type Application,
  type UserProfile,
  mockApplications,
  mockMyApplicationItems,
  mockMessages,
  mockUserProfiles,
} from "./lib/mockData";
import { toast, Toaster } from "sonner";
import { authApi, messagesApi } from "./lib/api";

type UserRole = "employee" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

type Page =
  | "login"
  | "signup"
  | "employee-home"
  | "employee-applications"
  | "employee-application-detail"
  | "employee-my-applications"
  | "employee-messages"
  | "employee-message-detail"
  | "admin-home"
  | "admin-forms"
  | "admin-form-editor"
  | "admin-users"
  | "admin-user-chat";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [myApplicationItems, setMyApplicationItems] = useState<
    MyApplicationItem[]
  >(mockMyApplicationItems);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>("");
  const [applications, setApplications] =
    useState<Application[]>(mockApplications);
  const [users, setUsers] = useState<UserProfile[]>(mockUserProfiles);
  const [loading, setLoading] = useState(true);

  // 既読処理済みメッセージIDを追跡
  const processedMessageIds = useRef<Set<string>>(new Set());

  // 初期化: セッションチェックとデータ読み込み
  useEffect(() => {
    const initialize = async () => {
      try {
        // セッションチェック
        const session = await authApi.getSession();

        if (session) {
          // ユーザー情報取得
          const { user } = await authApi.getCurrentUser();
          setCurrentUser(user);

          // データ読み込み
          await loadData();

          setCurrentPage(
            user.role === "admin" ? "admin-home" : "employee-home"
          );
        }
      } catch (error) {
        console.log("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // データ読み込み
  const loadData = async () => {
    try {
      const [messagesRes] = await Promise.all([messagesApi.getAll()]);

      setMessages(messagesRes.messages || []);
    } catch (error) {
      console.log("Load data error:", error);
      toast.error("データの読み込みに失敗しました");
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await authApi.login(email, password);

      const { user } = await authApi.getCurrentUser();
      setCurrentUser(user);

      await loadData();

      setCurrentPage(user.role === "admin" ? "admin-home" : "employee-home");
      toast.success("ログインしました");
    } catch (error: any) {
      console.log("Login error:", error);
      toast.error(error.message || "ログインに失敗しました");
    }
  };

  const handleSignup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => {
    try {
      await authApi.signup(name, email, password, role);

      // サインアップ後、自動ログイン
      await authApi.login(email, password);

      const { user } = await authApi.getCurrentUser();
      setCurrentUser(user);

      await loadData();

      setCurrentPage(role === "admin" ? "admin-home" : "employee-home");
      toast.success("アカウントを作成しました");
    } catch (error: any) {
      console.log("Signup error:", error);
      toast.error(error.message || "アカウント作成に失敗しました");
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setCurrentUser(null);
      setApplications([]);
      setMyApplicationItems([]);
      setMessages([]);
      setCurrentPage("login");
      toast.success("ログアウトしました");
    } catch (error: any) {
      console.log("Logout error:", error);
      toast.error("ログアウトに失敗しました");
    }
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const viewApplicationDetail = (id: string) => {
    setSelectedApplicationId(id);
    setCurrentPage("employee-application-detail");
  };

  const editForm = (id: string | null) => {
    setEditingFormId(id);
    setCurrentPage("admin-form-editor");
  };
  const addToMyApplications = (
    applicationId: string,
    title: string,
    memo: string
  ) => {
    if (!currentUser) return;

    const newItem: MyApplicationItem = {
      id: `item-${Date.now()}`,
      applicationId,
      userId: currentUser.id,
      title,
      memo,
      isCompleted: false,
      addedAt: new Date().toISOString(),
      completedAt: null,
    };

    setMyApplicationItems((prev) => [newItem, ...prev]);
    toast.success("マイ申請に追加しました");
  };

  const updateMyApplications = (items: MyApplicationItem[]) => {
    setMyApplicationItems(items);
  };

  const deleteMyApplication = (itemId: string) => {
    setMyApplicationItems((prev) =>
      prev.filter((item) => item.id !== itemId)
    );
    toast.success("マイ申請から削除しました");
  };

  const saveApplication = async (
    formData: Omit<Application, "id">,
    formId: string | null
  ) => {
    if (formId) {
      // 既存フォームの更新
      setApplications((prev) =>
        prev.map((app) =>
          app.id === formId ? { ...formData, id: formId } : app
        )
      );
      toast.success("申請フォームを更新しました");
    } else {
      // 新規フォームの追加
      const newApplication: Application = {
        ...formData,
        id: `app-${Date.now()}`,
      };
      setApplications((prev) => [...prev, newApplication]);
      toast.success("申請フォームを作成しました");
    }
    navigateTo("admin-forms");
  };

  const viewUserChat = (
    userId: string,
    userName: string,
    userEmail: string
  ) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSelectedUserEmail(userEmail);
    setCurrentPage("admin-user-chat");
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!currentUser) return;

    try {
      const { message } = await messagesApi.send(receiverId, content);
      setMessages((prev) => [...prev, message]);
    } catch (error: any) {
      console.log("Send message error:", error);
      toast.error("メッセージの送信に失敗しました");
    }
  };

  const markMessagesAsRead = (senderId: string) => {
    if (!currentUser) return;

    setMessages((prev) =>
      prev.map((msg) => {
        if (
          msg.senderId === senderId &&
          msg.receiverId === currentUser.id &&
          !msg.isRead
        ) {
          return { ...msg, isRead: true };
        }
        return msg;
      })
    );
  };

  // 未読メッセージ数を取得
  const getUnreadMessagesCount = () => {
    if (!currentUser) return 0;
    return messages.filter(
      (msg) => msg.receiverId === currentUser.id && !msg.isRead
    ).length;
  };

  // メッセージを既読にするエフェクト
  useEffect(() => {
    if (!currentUser) return;

    const markMessagesAsReadAsync = async () => {
      if (
        currentPage === "employee-messages" ||
        currentPage === "employee-message-detail"
      ) {
        // 管理者からの未読メッセージを取得（未処理のものだけ）
        const unreadMessages = messages.filter(
          (msg) =>
            msg.receiverId === currentUser.id &&
            !msg.isRead &&
            !processedMessageIds.current.has(msg.id)
        );

        if (unreadMessages.length > 0) {
          // 各メッセージを既読にする
          for (const msg of unreadMessages) {
            // 処理中としてマーク
            processedMessageIds.current.add(msg.id);

            try {
              await messagesApi.markAsRead(msg.id);
              // ローカルのstateも更新
              setMessages((prev) =>
                prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
              );
            } catch (error) {
              console.log("Mark message as read error:", error);
              // エラーの場合は処理済みフラグを削除
              processedMessageIds.current.delete(msg.id);
            }
          }
        }
      } else if (currentPage === "admin-user-chat" && selectedUserId) {
        // 選択されたユーザーからの未読メッセージを取得（未処理のものだけ）
        const unreadMessages = messages.filter(
          (msg) =>
            msg.senderId === selectedUserId &&
            msg.receiverId === currentUser.id &&
            !msg.isRead &&
            !processedMessageIds.current.has(msg.id)
        );

        if (unreadMessages.length > 0) {
          // 各メッセージを既読にする
          for (const msg of unreadMessages) {
            // 処理中としてマーク
            processedMessageIds.current.add(msg.id);

            try {
              await messagesApi.markAsRead(msg.id);
              // ローカルのstateも更新
              setMessages((prev) =>
                prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
              );
            } catch (error) {
              console.log("Mark message as read error:", error);
              // エラーの場合は処理済みフラグを削除
              processedMessageIds.current.delete(msg.id);
            }
          }
        }
      }
    };

    markMessagesAsReadAsync();
  }, [currentPage, selectedUserId, currentUser, messages]);

  const renderPage = () => {
    if (!currentUser) {
      switch (currentPage) {
        case "signup":
          return (
            <SignupPage
              onSignup={handleSignup}
              onBackToLogin={() => navigateTo("login")}
            />
          );
        default:
          return (
            <LoginPage
              onLogin={handleLogin}
              onSignup={() => navigateTo("signup")}
            />
          );
      }
    }

    const unreadCount = getUnreadMessagesCount();

    // 社員用画面
    if (currentUser.role === "employee") {
      switch (currentPage) {
        case "employee-applications":
          return (
            <EmployeeApplicationList
              applications={applications}
              onViewDetail={viewApplicationDetail}
              user={currentUser}
              onNavigate={navigateTo as (page: string) => void}
              onLogout={handleLogout}
              unreadMessagesCount={unreadCount}
            />
          );
        case "employee-application-detail":
          return (
            <EmployeeApplicationDetail
              applications={applications}
              applicationId={selectedApplicationId}
              user={currentUser}
              onNavigate={navigateTo as (page: string) => void}
              onLogout={handleLogout}
              onAddToMyApplications={addToMyApplications}
              unreadMessagesCount={unreadCount}
            />
          );
        case "employee-my-applications":
          return (
            <EmployeeMyApplications
              applications={applications}
              user={currentUser}
              onNavigate={navigateTo as (page: string) => void}
              onLogout={handleLogout}
              onViewDetail={viewApplicationDetail}
              items={myApplicationItems}
              onAddToMyApplications={addToMyApplications}
              onUpdateMyApplications={updateMyApplications}
              onDeleteMyApplication={deleteMyApplication}
              unreadMessagesCount={unreadCount}
            />
          );
        case "employee-messages":
          return (
            <EmployeeMessages
              user={currentUser}
              onNavigate={navigateTo as (page: string) => void}
              onLogout={handleLogout}
              onViewMessageDetail={() => navigateTo("employee-message-detail")}
              messages={messages}
              unreadMessagesCount={unreadCount}
            />
          );
        case "employee-message-detail":
          return (
            <EmployeeMessageDetail
              user={currentUser}
              onNavigate={navigateTo as (page: string) => void}
              onLogout={handleLogout}
              messages={messages}
              onSendMessage={sendMessage}
              unreadMessagesCount={unreadCount}
            />
          );
        default:
          return (
            <EmployeeHome
              applications={applications}
              onViewDetail={viewApplicationDetail}
              user={currentUser}
              onNavigate={navigateTo as (page: string) => void}
              onLogout={handleLogout}
              myApplicationItems={myApplicationItems}
              unreadMessagesCount={unreadCount}
            />
          );
      }
    }

    // アドミン用画面
    if (currentUser.role === "admin") {
      switch (currentPage) {
        case "admin-forms":
          return (
            <AdminFormManagement
              applications={applications}
              user={currentUser}
              onNavigate={navigateTo as (page: string) => void}
              onLogout={handleLogout}
              onEditForm={editForm}
            />
          );
        case "admin-form-editor":
          return (
            <AdminFormEditor
              applications={applications}
              formId={editingFormId}
              user={currentUser}
              onNavigate={navigateTo as (page: string) => void}
              onLogout={handleLogout}
              onSaveForm={saveApplication}
            />
          );
        case "admin-users":
          return (
            <AdminUserList
              user={currentUser}
              onNavigate={navigateTo as (page: string) => void}
              onLogout={handleLogout}
              onViewUserChat={viewUserChat}
              messages={messages}
            />
          );
        case "admin-user-chat":
          return (
            <AdminUserChat
              targetUserId={selectedUserId || ""}
              targetUserName={selectedUserName}
              targetUserEmail={selectedUserEmail}
              user={currentUser}
              onNavigate={navigateTo as (page: string) => void}
              onLogout={handleLogout}
              messages={messages}
              onSendMessage={sendMessage}
            />
          );
        default:
          return (
            <AdminHome
              applications={applications}
              user={currentUser}
              onNavigate={navigateTo as (page: string) => void}
              onLogout={handleLogout}
              onEditForm={editForm}
            />
          );
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
