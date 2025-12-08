import { createApp } from "./app.ts"; // アプリ生成関数

const app = createApp(); // ルートやミドルウェアをセットした Hono アプリ

Deno.serve(app.fetch); // Deno の HTTP サーバーとして起動
