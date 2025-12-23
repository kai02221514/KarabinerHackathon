import { Hono } from "npm:hono"; // アプリ本体作成用
import { cors } from "npm:hono/cors"; // CORS ミドルウェア
import { logger } from "npm:hono/logger"; // ログ出力ミドルウェア
import { authRoutes } from "./routes/auth.ts"; // 認証ルーター
import { healthRoutes } from "./routes/health.ts"; // ヘルスチェック
import { adminRoutes } from "./routes/admin.ts";
import { messageRoutes } from "./routes/messages.ts";
import { applicationRoutes } from "./routes/applications.ts";
import { myApplicationRoutes } from "./routes/myApplications.ts";

export function createApp() {
  const app = new Hono(); // Hono アプリインスタンスを生成

  // 共通ミドルウェア: ログを標準出力へ
  app.use("*", logger(console.log));
  // 共通ミドルウェア: 全経路に CORS を許可
  app.use(
    "/*",
    cors({
      origin: "*",
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
    }),
  );

  // ルートモジュールをマウント
  app.route("/", healthRoutes);
  app.route("/", authRoutes);
  app.route("/", adminRoutes);
  app.route("/", messageRoutes);
  app.route("/", applicationRoutes);
  app.route("/", myApplicationRoutes);

  return app; // 完成したアプリを返す
}
