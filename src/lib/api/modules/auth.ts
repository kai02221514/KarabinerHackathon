import { API_BASE, publicAnonKey } from "../config.ts"; // API エンドポイント情報と anon キー
import { apiRequest } from "../http.ts"; // 共通 fetch ラッパー
import { supabase } from "../client.ts"; // Supabase クライアント

// 認証まわりのフロント用 API クライアント
export const authApi = {
  // サインアップ（バックエンドの signup エンドポイントを直叩き）
  async signup(
    name: string,
    email: string,
    password: string,
    role: "employee" | "admin",
  ) {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`, // anon キーで署名
      },
      body: JSON.stringify({ name, email, password, role }), // ユーザー情報を送信
    });

    if (!response.ok) {
      const error = await response.json(); // エラー内容を取得
      throw new Error(error.error || "Signup failed"); // 例外として通知
    }

    return response.json(); // 作成されたユーザー情報を返す
  },

  // ログイン（Supabase Auth）
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    }); // メール・パスワードでサインイン

    if (error) {
      throw new Error(error.message); // エラーをそのまま表示
    }

    return data; // セッション情報などを返す
  },

  // ログアウト
  async logout() {
    const { error } = await supabase.auth.signOut(); // セッションを破棄
    if (error) {
      throw new Error(error.message);
    }
  },

  // ログイン中ユーザーのプロフィール取得
  async getCurrentUser() {
    return apiRequest("/auth/me"); // バックエンド経由でユーザー情報取得
  },

  // 現在のセッション取得
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession(); // セッションを Supabase から取得
    if (error) {
      throw new Error(error.message);
    }
    return session; // セッションオブジェクトを返却
  },
};
