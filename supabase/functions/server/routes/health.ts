import { Hono } from "npm:hono"; // ルーター作成用
import { API_PREFIX } from "../constants.ts"; // API パスのプレフィックス

// ヘルスチェック専用ルーター
export const healthRoutes = new Hono();

// 稼働確認用エンドポイント
healthRoutes.get(`${API_PREFIX}/health`, (c) => {
  return c.json({ status: "ok" }); // 200 でシンプルな JSON を返す
});
