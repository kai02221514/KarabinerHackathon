import { apiRequest } from "../http.ts"; // 共通 API ラッパー

// users エンドポイント（管理者向け）
export const usersApi = {
  async getAll() {
    return apiRequest("/users"); // 全ユーザー一覧
  },
};
