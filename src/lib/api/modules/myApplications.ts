import { apiRequest } from "../http.ts"; // 共通 API ラッパー

// my_applications エンドポイントを叩くクライアント
export const myApplicationsApi = {
  async getAll() {
    return apiRequest("/my-applications"); // 自分の申請一覧取得
  },

  async add(applicationId: string, title: string, memo: string) {
    return apiRequest("/my-applications", {
      method: "POST",
      body: JSON.stringify({ applicationId, title, memo }), // 新規追加データ
    });
  },

  async update(id: string, updates: any) {
    return apiRequest(`/my-applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates), // 更新内容
    });
  },

  async delete(id: string) {
    return apiRequest(`/my-applications/${id}`, {
      method: "DELETE", // レコード削除
    });
  },
};
