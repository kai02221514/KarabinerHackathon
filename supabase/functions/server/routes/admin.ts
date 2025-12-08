import { Hono } from "npm:hono"; // ルーター作成用
import { supabase } from "../config/supabaseClient.ts"; // Supabase クライアント
import { API_PREFIX } from "../constants.ts"; // API パスのプレフィックス
import { authenticate, getUserProfile } from "../lib/auth.ts"; // 認証・プロフィール取得ヘルパー

// 管理系のルーター
export const adminRoutes = new Hono();

// 全ユーザー取得（アドミンのみ）
adminRoutes.get(`${API_PREFIX}/users`, async (c) => {
  const user = await authenticate(c.req.header("Authorization") ?? null); // 認証確認

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const profile = await getUserProfile(user.id); // プロファイル取得
    if (!profile) {
      return c.json({ error: "User not found" }, 404);
    }
    if (profile.role !== "admin") {
      return c.json({ error: "Forbidden" }, 403); // 管理者以外は拒否
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: true }); // 作成日時順で取得

    if (error) {
      console.log("Users list error:", error);
      return c.json({ error: "Internal error" }, 500);
    }

    return c.json({ users: data ?? [] }); // そのまま返却
  } catch (error) {
    console.log("Users list unexpected error:", error);
    return c.json({ error: "Internal error" }, 500);
  }
});