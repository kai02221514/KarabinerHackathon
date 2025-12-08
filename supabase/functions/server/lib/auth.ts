import type { User } from "jsr:@supabase/supabase-js"; // Supabase の User 型
import { supabase } from "../config/supabaseClient.ts"; // サービスロールの Supabase クライアント
import type { Role, UserProfile } from "../types.ts"; // 型定義

// Authorization ヘッダーからトークンを取り出し、Supabase Auth で検証
export async function authenticate(
  authHeader: string | null,
): Promise<User | null> {
  if (!authHeader) {
    // ヘッダーなしなら未認証
    return null;
  }

  const [scheme, token] = authHeader.split(" "); // "Bearer <token>" を分割
  if (scheme !== "Bearer" || !token) {
    // フォーマット不正なら未認証扱い
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token); // トークンからユーザーを取得
  if (error || !user) {
    console.log("Authentication error:", error);
    return null;
  }

  return user; // 成功時は User を返す
}

// DB の users テーブルからプロファイルを取得
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle(); // 1件または null を取得

  if (error) {
    console.log("getUserProfile error:", error);
    throw error;
  }
  if (!data) return null; // 見つからない場合は null

  // DB カラムをアプリ側の型に変換
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as Role,
  };
}
