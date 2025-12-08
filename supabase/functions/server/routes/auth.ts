import { Hono } from "npm:hono"; // ルーター作成用
import { supabase } from "../config/supabaseClient.ts"; // Supabase クライアント
import { API_PREFIX } from "../constants.ts"; // API パスのプレフィックス
import { authenticate, getUserProfile } from "../lib/auth.ts"; // 認証ヘルパー
import type { UserProfile } from "../types.ts"; // 型定義

// 認証関連のルーター
export const authRoutes = new Hono();

// ユーザー登録
authRoutes.post(`${API_PREFIX}/auth/signup`, async (c) => {
  try {
    const { name, email, password, role } = await c.req.json(); // リクエストボディ取得

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true,
    }); // Supabase Auth にユーザーを作成

    if (error || !data.user) {
      // 作成失敗時は 400
      console.log("Signup error:", error);
      return c.json({ error: error?.message ?? "Signup failed" }, 400);
    }

    const { error: insertError } = await supabase.from("users").insert({
      id: data.user.id,
      name,
      email,
      role,
    }); // users テーブルにプロフィールを保存

    if (insertError) {
      // Auth 側は作成済みなので 500 応答のみ
      console.log("Signup users insert error:", insertError);
      return c.json({ error: "Signup failed (profile insert error)" }, 500);
    }

    const userProfile: UserProfile = {
      id: data.user.id,
      name,
      email,
      role,
    }; // 返却用プロフィール生成

    return c.json({ user: userProfile }); // 正常応答
  } catch (error) {
    console.log("Signup error:", error);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// 現在のユーザー情報取得
authRoutes.get(`${API_PREFIX}/auth/me`, async (c) => {
  const user = await authenticate(c.req.header("Authorization") ?? null); // トークン検証

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401); // 未認証
  }

  try {
    const profile = await getUserProfile(user.id); // プロファイル取得
    if (!profile) {
      return c.json({ error: "User not found" }, 404); // 見つからない
    }
    return c.json({ user: profile }); // プロファイル返却
  } catch {
    return c.json({ error: "Internal error" }, 500); // 予期せぬエラー
  }
});
