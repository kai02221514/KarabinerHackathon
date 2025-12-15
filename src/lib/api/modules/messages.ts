import { apiRequest } from "../http.ts"; // 共通 API ラッパー

// messages エンドポイントを叩くクライアント
export const messagesApi = {
  async getAll() {
    return apiRequest("/messages"); // 自分が関与するメッセージ一覧
  },

  async send(receiverId: string, content: string) {
    return apiRequest("/messages", {
      method: "POST",
      body: JSON.stringify({ receiverId, content }), // 送信先と本文
    });
  },

  async markAsRead(id: string) {
    return apiRequest(`/messages/${id}/read`, {
      method: "PUT", // 既読フラグ更新
    });
  },
};
