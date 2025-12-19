import { apiRequest } from "../http.ts"; // 共通 API ラッパー

// applications エンドポイントを叩くクライアント
export const applicationsApi = {
  async getAll() {
    return apiRequest("/applications"); // 一覧取得
  },

  async getById(id: string) {
    return apiRequest(`/applications/${id}`); // ID で詳細取得
  },

  async save(data: any) {
    return apiRequest("/applications", {
      method: "POST",
      body: JSON.stringify(data), // 作成・更新用データ
    });
  },
};
