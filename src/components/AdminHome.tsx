import Header from "./Header";
import { type Application } from "../lib/mockData";
import { Button } from "./ui/button";
import { FileText, Clock } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "employee" | "admin";
}

interface AdminHomeProps {
  applications: Application[];
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onEditForm: (id: string | null) => void;
}

export default function AdminHome({
  applications,
  user,
  onNavigate,
  onLogout,
  onEditForm,
}: AdminHomeProps) {
  const totalForms = applications.length;
  const publishedForms = applications.filter((app) => app.isPublished).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={user.name}
        onLogout={onLogout}
        role="admin"
        onNavigate={onNavigate}
        currentPage="admin-home"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-2">管理者ダッシュボード</h1>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-gray-600 mb-2">登録フォーム数</div>
                <div className="mb-1">{totalForms}件</div>
                <div className="text-gray-600">公開中: {publishedForms}件</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-gray-600 mb-2">非公開フォーム</div>
                <div className="mb-1">{totalForms - publishedForms}件</div>
                <div className="text-gray-600">下書き・準備中</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 最近公開されたフォーム */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2>最近公開されたフォーム</h2>
          </div>
          {applications.filter((app) => app.isPublished).slice(0, 3).length ===
          0 ? (
            <div className="p-8 text-center text-gray-500">
              公開中のフォームはありません
            </div>
          ) : (
            <div>
              {applications
                .filter((app) => app.isPublished)
                .slice(0, 3)
                .map((app, index) => (
                  <div
                    key={app.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      index !==
                      applications.filter((a) => a.isPublished).slice(0, 5)
                        .length -
                        1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                    onClick={() => onNavigate("admin-forms")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-1">{app.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 text-sm">
                            {app.submissionMethod}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditForm(app.id);
                        }}
                      >
                        管理
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
