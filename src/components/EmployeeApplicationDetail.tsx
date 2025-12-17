import { useState } from "react";
import Header from "./Header";
import { type Application, mockSubmissions } from "../lib/mockData";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ExternalLink, Plus, X } from "lucide-react";
import { toast, Toaster } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: "employee" | "admin";
}

interface EmployeeApplicationDetailProps {
  applications: Application[];
  applicationId: string | null;
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onAddToMyApplications: (
    applicationId: string,
    title: string,
    memo: string,
  ) => void;
  unreadMessagesCount?: number;
}

export default function EmployeeApplicationDetail({
  applications,
  applicationId,
  user,
  onNavigate,
  onLogout,
  onAddToMyApplications,
  unreadMessagesCount = 0,
}: EmployeeApplicationDetailProps) {
  const application = applications.find((app) => app.id === applicationId);

  // ユーザーの提出状況を取得
  const submission = mockSubmissions.find(
    (s) => s.applicationId === applicationId && s.userId === user.id,
  );

  const [isSubmitted, setIsSubmitted] = useState(
    submission?.status === "submitted",
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addMemo, setAddMemo] = useState("");

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          userName={user.name}
          onLogout={onLogout}
          role="employee"
          onNavigate={onNavigate}
          currentPage="employee-application-detail"
          unreadMessagesCount={unreadMessagesCount}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">申請が見つかりませんでした</p>
            <Button
              variant="outline"
              onClick={() => onNavigate("employee-applications")}
              className="mt-4"
            >
              申請一覧に戻る
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleMarkAsSubmitted = () => {
    setIsSubmitted(true);
    // 実際のアプリではSupabaseに保存
  };

  const handleOpenSubmissionUrl = () => {
    if (application.submissionUrl.startsWith("http")) {
      window.open(application.submissionUrl, "_blank");
    } else {
      window.location.href = application.submissionUrl;
    }
  };

  const handleAddToMyApplications = () => {
    setShowAddModal(true);
    // デフォルトのタイトルを設定
    setAddTitle(application.name);
  };

  const handleSaveToMyApplications = () => {
    // マイ申請に追加
    onAddToMyApplications(applicationId!, addTitle, addMemo);
    setShowAddModal(false);
    setAddTitle("");
    setAddMemo("");

    // 成功通知を表示（クリックで遷移）
    toast.success("マイ申請に追加しました", {
      duration: 3000,
      action: {
        label: "マイ申請を開く",
        onClick: () => {
          onNavigate("employee-my-applications");
        },
      },
    });
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setAddTitle("");
    setAddMemo("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={user.name}
        onLogout={onLogout}
        role="employee"
        onNavigate={onNavigate}
        currentPage="employee-application-detail"
        unreadMessagesCount={unreadMessagesCount}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          onClick={() => onNavigate("employee-applications")}
          className="mb-6"
        >
          ← 申請一覧に戻る
        </Button>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* ヘッダー部分 */}
          <div className="bg-blue-50 border-b border-blue-100 p-6">
            <div className="flex items-start justify-between mb-2">
              <h1>{application.name}</h1>
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="mb-2">概要</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {application.description}
              </p>
            </div>

            <div>
              <h2 className="mb-2">提出方法</h2>
              <p className="text-gray-700">{application.submissionMethod}</p>
            </div>

            {application.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="mb-2">注意事項</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {application.notes}
                </p>
              </div>
            )}

            {/* アクションボタン */}
            <div className="pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleOpenSubmissionUrl}
                  className="w-full"
                  size="lg"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  提出先を開く
                </Button>

                <Button
                  onClick={handleAddToMyApplications}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  マイ申請に追加
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* マイ申請追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
            <button
              onClick={handleCancelAdd}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4">マイ申請に追加</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="add-title">タイトル</Label>
                <Input
                  id="add-title"
                  type="text"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  placeholder="例：月末締めの経費申請"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="add-memo">メモ（任意）</Label>
                <textarea
                  id="add-memo"
                  value={addMemo}
                  onChange={(e) => setAddMemo(e.target.value)}
                  placeholder="なぜこの申請が必要か、注意点などを記入してください"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSaveToMyApplications}
                  disabled={!addTitle.trim()}
                  className="flex-1"
                >
                  追加する
                </Button>
                <Button
                  onClick={handleCancelAdd}
                  variant="outline"
                  className="flex-1"
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
