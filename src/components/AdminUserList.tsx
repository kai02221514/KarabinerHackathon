import { useState, useEffect } from "react";
import Header from "./Header";
import { type Message } from "../lib/mockData";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { MessageSquare } from "lucide-react";
import { usersApi } from "../lib/api/modules/users";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: "employee" | "admin";
}

interface Users {
  id: string;
  name: string;
  email: string;
  role: "employee" | "admin";
}

interface AdminUserListProps {
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onViewUserChat: (userId: string, userName: string, userEmail: string) => void;
  messages: Message[];
}

export default function AdminUserList({
  user,
  onNavigate,
  onLogout,
  onViewUserChat,
  messages,
}: AdminUserListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);

  // ユーザー一覧を取得
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { users } = await usersApi.getAll();
        // 自分を除く全ての管理者と従業員を取得
        const filteredUsers = users.filter((u: Users) => u.id !== user.id);
        setUsers(filteredUsers);
      } catch (error: any) {
        console.log("Load users error:", error);
        toast.error("ユーザー一覧の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // 各ユーザーの未読メッセージ数を取得
  const getUnreadCount = (userId: string) => {
    return messages.filter(
      (msg) =>
        msg.senderId === userId && msg.receiverId === user.id && !msg.isRead
    ).length;
  };

  // 最新メッセージを取得
  const getLatestMessage = (userId: string) => {
    const userMessages = messages
      .filter(
        (msg) =>
          (msg.senderId === userId && msg.receiverId === user.id) ||
          (msg.senderId === user.id && msg.receiverId === userId)
      )
      .sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );

    return userMessages[0];
  };

  // 検索フィルタリング
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={user.name}
        onLogout={onLogout}
        role="admin"
        onNavigate={onNavigate}
        currentPage="admin-users"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索エリア */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="max-w-md">
            <Label htmlFor="search">ユーザー名で検索</Label>
            <Input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索..."
              className="mt-1"
            />
          </div>
        </div>

        {/* ユーザーリスト */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? "該当するユーザーが見つかりませんでした"
                : "ユーザーが登録されていません"}
            </div>
          ) : (
            <>
              {/* デスクトップ: テーブル表示 */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700">
                        ユーザー名
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        メールアドレス
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        最新メッセージ
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => {
                      const unreadCount = getUnreadCount(user.id);
                      const latestMessage = getLatestMessage(user.id);
                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-gray-50 ${
                            index !== filteredUsers.length - 1
                              ? "border-b border-gray-200"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {user.name}
                              {unreadCount > 0 && (
                                <Badge variant="default" className="bg-red-600">
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {latestMessage ? (
                              <div className="max-w-xs truncate text-sm">
                                {latestMessage.content.substring(0, 30)}
                                {latestMessage.content.length > 30 ? "..." : ""}
                              </div>
                            ) : (
                              <span className="text-gray-400">
                                メッセージなし
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onViewUserChat(user.id, user.name, user.email)
                              }
                            >
                              <MessageSquare className="mr-1 h-3 w-3" />
                              メッセージ
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* モバイル: カード表示 */}
              <div className="md:hidden">
                {filteredUsers.map((user, index) => {
                  const unreadCount = getUnreadCount(user.id);
                  const latestMessage = getLatestMessage(user.id);
                  return (
                    <div
                      key={user.id}
                      className={`p-4 ${
                        index !== filteredUsers.length - 1
                          ? "border-b border-gray-200"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{user.name}</span>
                            {unreadCount > 0 && (
                              <Badge
                                variant="default"
                                className="bg-red-600 text-xs"
                              >
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="text-gray-600 text-sm">
                            {user.email}
                          </div>
                          {latestMessage && (
                            <div className="text-gray-600 text-sm mt-2 truncate">
                              {latestMessage.content.substring(0, 40)}
                              {latestMessage.content.length > 40 ? "..." : ""}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onViewUserChat(user.id, user.name, user.email)
                        }
                        className="w-full mt-2"
                      >
                        <MessageSquare className="mr-1 h-3 w-3" />
                        メッセージ
                      </Button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 統計情報 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-gray-600 mb-2">未読メッセージ</div>
            <div className="text-red-600">
              {users.reduce((sum, user) => sum + getUnreadCount(user.id), 0)}件
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
