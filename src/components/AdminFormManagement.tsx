import { useState } from "react";
import Header from "./Header";
import { type Application } from "../lib/mockData";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Edit, Plus } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "employee" | "admin";
}

interface AdminFormManagementProps {
  applications: Application[];
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onEditForm: (id: string | null) => void;
  formFilter: 'all' | 'published' | 'unpublished'; //フィルター条件を受け取るための変数
  setFormFilter: (filter: 'all' | 'published' | 'unpublished') => void;
}

export default function AdminFormManagement({
  applications,
  user,
  onNavigate,
  onLogout,
  onEditForm,
  formFilter,
  setFormFilter
}: AdminFormManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  console.log(applications)

  // フィルタリング
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
     formFilter === "all" || 
      (formFilter === "published" && app.isPublished) || 
      (formFilter === "unpublished" && !app.isPublished);

    const matchesMethod = 
      methodFilter === "all" || 
      app.submissionMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={user.name}
        onLogout={onLogout}
        role="admin"
        onNavigate={onNavigate}
        currentPage="admin-forms"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1>申請フォーム管理</h1>
          <Button onClick={() => onEditForm(null)}>
            <Plus className="mr-2 h-4 w-4" />
            新規フォーム作成
          </Button>
        </div>

        {/* フィルタエリア */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">  
            <div>
              <Label htmlFor="search">キーワード検索</Label>
              <Input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="フォーム名で検索..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">公開状態</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={formFilter}
                onChange={(e) => setFormFilter(e.target.value as "all" | "published" | "unpublished")}
              >
                <option value="all">すべて</option>
                <option value="published">公開中</option>
                <option value="unpublished">非公開</option>
              </select>
            </div>

            <div>
              <Label htmlFor="method">提出方法</Label>
              <select
                id="method"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="all">すべての方法</option>
                {/* 重複を除いた提出方法のリストを動的に生成する場合 */}
                {Array.from(new Set(applications.map(app => app.submissionMethod))).map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? "該当するフォームが見つかりませんでした"
                : "登録されているフォームがありません"}
            </div>
          ) : (
            <>
              {/* デスクトップ: テーブル表示 */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700">
                        申請名
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        提出方法
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        公開状態
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app, index) => (
                      <tr
                        key={app.id}
                        className={`hover:bg-gray-50 ${
                          index !== filteredApplications.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4">{app.name}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {app.submissionMethod}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={app.isPublished ? "default" : "secondary"}
                          >
                            {app.isPublished ? "公開中" : "非公開"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditForm(app.id)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            編集
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* モバイル: カード表示 */}
              <div className="md:hidden">
                {filteredApplications.map((app, index) => (
                  <div
                    key={app.id}
                    className={`p-4 ${
                      index !== filteredApplications.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-2">{app.name}</div>
                      <Badge
                        variant={app.isPublished ? "default" : "secondary"}
                      >
                        {app.isPublished ? "公開中" : "非公開"}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="text-gray-600 text-sm">
                        {app.submissionMethod}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditForm(app.id)}
                      className="w-full"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      編集
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 統計情報 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-gray-600 mb-2">登録フォーム数</div>
            <div>{applications.length}件</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-gray-600 mb-2">公開中</div>
            <div className="text-green-600">
              {applications.filter((app) => app.isPublished).length}件
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-gray-600 mb-2">非公開</div>
            <div className="text-gray-600">
              {applications.filter((app) => !app.isPublished).length}件
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
