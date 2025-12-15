import Header from "./Header";
import { type Message } from "../lib/mockData";
import { Badge } from "./ui/badge";
import { MessageSquare } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "employee" | "admin";
}

interface EmployeeMessagesProps {
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onViewMessageDetail: () => void;
  messages: Message[];
  unreadMessagesCount: number;
}

export default function EmployeeMessages({
  user,
  onNavigate,
  onLogout,
  onViewMessageDetail,
  messages,
  unreadMessagesCount,
}: EmployeeMessagesProps) {
  // このユーザー宛てのメッセージを取得
  const userMessages = messages
    .filter((msg) => msg.receiverId === user.id || msg.senderId === user.id)
    .sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );

  // メッセージをグループ化（最新のメッセージのみ表示）
  const latestMessages = userMessages.length > 0 ? [userMessages[0]] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={user.name}
        onLogout={onLogout}
        role="employee"
        onNavigate={onNavigate}
        currentPage="employee-messages"
        unreadMessagesCount={unreadMessagesCount}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="mb-6">メッセージ</h1>

        {/* メッセージリスト */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {latestMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              メッセージはまだありません
            </div>
          ) : (
            <>
              {/* デスクトップ: リスト表示 */}
              <div className="hidden md:block">
                {latestMessages.map((msg, index) => {
                  const isUnread = !msg.isRead && msg.receiverId === user.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={onViewMessageDetail}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${index !== latestMessages.length - 1
                          ? "border-b border-gray-200"
                          : ""
                        } ${isUnread ? "bg-blue-50" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span>管理者からのメッセージ</span>
                              {isUnread && (
                                <Badge variant="default" className="bg-red-600">
                                  新着
                                </Badge>
                              )}
                            </div>
                            <div className="text-gray-600 mb-1">
                              {msg.content.substring(0, 80)}
                              {msg.content.length > 80 ? "..." : ""}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(msg.sentAt).toLocaleString("ja-JP", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* モバイル: カード表示 */}
              <div className="md:hidden">
                {latestMessages.map((msg, index) => {
                  const isUnread = !msg.isRead && msg.receiverId === user.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={onViewMessageDetail}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${index !== latestMessages.length - 1
                          ? "border-b border-gray-200"
                          : ""
                        } ${isUnread ? "bg-blue-50" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span>管理者からのメッセージ</span>
                        {isUnread && (
                          <Badge
                            variant="default"
                            className="bg-red-600 text-xs"
                          >
                            新着
                          </Badge>
                        )}
                      </div>
                      <div className="text-gray-600 mb-2 line-clamp-2">
                        {msg.content}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(msg.sentAt).toLocaleString("ja-JP", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ヒント */}
        {latestMessages.length === 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900">
              💡
              管理者からのメッセージがここに表示されます。申請に関する連絡や催促などを受け取れます。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
