// Supabase Auth の User 型をインポート。
// ユーザーIDやメールなど、Auth が返すユーザー情報の型。
import type { User } from "jsr:@supabase/supabase-js";

// Service Role 権限でアクセスする Supabase クライアント。
// Auth の検証や DB 読み書きなど権限が必要な処理が可能。
import { supabase } from "../config/supabaseClient.ts";

// アプリ内部で使う型（ユーザープロファイル用）を読み込み。
import type { Role, UserProfile } from "../types.ts";

// -------------------------------------------------------------
// 認証関数 authenticate()
//
// Authorization ヘッダーからアクセストークンを取り出し、
// Supabase Auth を使って「本物のユーザーかどうか」検証する。
// -------------------------------------------------------------

export async function authenticate(
  authHeader: string | null,
): Promise<User | null> {
  // Authorization ヘッダー自体が存在しない場合は未ログイン扱い
  if (!authHeader) {
    return null;
  }

  // Authorization ヘッダーは一般的に "Bearer <token>" という形式。
  // そのため「スペース」で分割して scheme = "Bearer", token = アクセストークン に分ける。
  const [scheme, token] = authHeader.split(" ");

  // フォーマットが正しくない（例: "Token ..."）場合も未認証扱い。
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  // Supabase Auth に token を渡してユーザー情報を取得する。
  // ここで token が不正・期限切れ・偽造 などであれば user は null。
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  // エラー発生 or ユーザーが見つからなければ未認証扱いとして null を返す
  if (error || !user) {
    console.log("Authentication error:", error);
    return null;
  }

  // 正常に認証できた場合は User オブジェクトを返す
  return user;
}

// -------------------------------------------------------------
// ユーザープロファイル取得 getUserProfile()
//
// Supabase Auth のユーザーID（auth.users の id）を使って、
// アプリ独自の users テーブルからプロフィール情報を取得する。
// -------------------------------------------------------------

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  // users テーブルから該当ユーザーの行を取得する。
  // .maybeSingle() = 0件なら null、1件ならその行、2件以上ならエラー
  const { data, error } = await supabase
    .from("users") // アプリ側のユーザーテーブル
    .select("*") // 全列を取得
    .eq("id", userId) // Auth ID と同じ ID の行を取る
    .maybeSingle(); // 1件か null を返す

  // DB 操作でエラーが発生した場合はログに記録し、呼び出し元に例外として投げる
  if (error) {
    console.log("getUserProfile error:", error);
    throw error;
  }

  // 該当ユーザーが存在しない（まだプロフィールを作っていない）場合は null
  if (!data) return null;

  // DB 行の構造をアプリ側の UserProfile 型に整形して返す
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as Role, // role カラムをアプリの Role 型にキャスト
  };
}
