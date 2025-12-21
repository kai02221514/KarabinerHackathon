import { useState } from "react";
import Header from "./Header";
import { type Application } from "../lib/mockData";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";

interface User {
  id: string;
  name: string;
  email: string;
  role: "employee" | "admin";
}

interface AdminFormEditorProps {
  applications: Application[];
  formId: string | null;
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onSaveForm: (
    formData: Omit<Application, "id">,
    formId: string | null,
  ) => void;
  onDeleteForm?: (formId: string) => void;
}

export default function AdminFormEditor({
  applications,
  formId,
  user,
  onNavigate,
  onLogout,
  onSaveForm,
  onDeleteForm,
}: AdminFormEditorProps) {
  const existingForm = formId
    ? applications.find((app) => app.id === formId)
    : null;
  const isEditMode = !!existingForm;

  const [formData, setFormData] = useState({
    name: existingForm?.name || "",
    description: existingForm?.description || "",
    submissionMethod: existingForm?.submissionMethod || "",
    submissionUrl: existingForm?.submissionUrl || "",
    notes: existingForm?.notes || "",
    isPublished: existingForm?.isPublished ?? true,
  });

  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // 実際のアプリではSupabaseに保存
    console.log("Saving form:", formData);
    setIsSaved(true);

    // 保存後、一覧画面に戻る
    setTimeout(() => {
      onNavigate("admin-forms");
    }, 1000);

    // 保存処理を呼び出す
    onSaveForm(formData, formId);
  };

  const handleDelete = () => {
    if (formId && onDeleteForm) {
      onDeleteForm(formId);
      onNavigate("admin-forms");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={user.name}
        onLogout={onLogout}
        role="admin"
        onNavigate={onNavigate}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          onClick={() => onNavigate("admin-forms")}
          className="mb-6"
        >
          ← フォーム管理に戻る
        </Button>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="mb-6">
            {isEditMode ? "フォーム編集" : "新規フォーム作成"}
          </h1>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">申請名 *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="例: 勤怠報告"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">概要 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="この申請の目的や内容を説明してください"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionMethod">提出方法 *</Label>
              <Input
                id="submissionMethod"
                type="text"
                value={formData.submissionMethod}
                onChange={(e) =>
                  handleChange("submissionMethod", e.target.value)
                }
                placeholder="例: Google Form、Slack、メール"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionUrl">提出先 URL または連絡先 *</Label>
              <Input
                id="submissionUrl"
                type="text"
                value={formData.submissionUrl}
                onChange={(e) => handleChange("submissionUrl", e.target.value)}
                placeholder="例: https://forms.google.com/... または mailto:example@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">注意事項（任意）</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="申請時の注意点やよくある質問などを記入してください"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  handleChange("isPublished", checked)
                }
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                公開する（社員が閲覧可能になります）
              </Label>
            </div>

            {isSaved && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded">
                フォームを保存しました
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="submit" className="flex-1">
                保存
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate("admin-forms")}
                className="flex-1"
              >
                キャンセル
              </Button>
              {isEditMode && onDeleteForm && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1"
                >
                  削除
                </Button>
              )}
            </div>
          </form>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">フォームの削除</h2>
              <p className="mb-4">
                このフォームを削除しますか？この操作は取り消せません。
              </p>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  キャンセル
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="ml-2"
                >
                  削除
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
