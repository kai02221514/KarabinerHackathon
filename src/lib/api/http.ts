import { API_BASE, publicAnonKey } from "./config.ts"; // API 基本設定
import { supabase } from "./client.ts"; // Supabase クライアント

// 現在のセッションからアクセストークンを取り出す
async function getAuthToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession(); // セッション取得
  return session?.access_token || null; // トークンまたは null を返す
}

// 共通の API リクエストラッパー
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken(); // 認証トークンを取得

  const headers: HeadersInit = {
    "Content-Type": "application/json", // JSON 基本ヘッダー
    ...options.headers, // 呼び出し側で上書き可能
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`; // ログイン済みならセッショントークン
  } else {
    headers["Authorization"] = `Bearer ${publicAnonKey}`; // 未ログイン時は anon キー
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers, // 合成したヘッダーを付与
  }); // API にリクエスト

  if (!response.ok) {
    const error = await response.json(); // エラー本文を取得
    throw new Error(error.error || "API request failed"); // メッセージを投げる
  }

  return response.json(); // 正常時は JSON を返す
}
