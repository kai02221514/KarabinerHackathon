// Supabase SDK の createClient 関数と型 SupabaseClient を読み込む。
// createClient = Supabase に接続するためのクライアントを作る関数
// SupabaseClient = そのクライアントの型
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js";

// ---------------------------------------------------------
// 1. 環境変数から Supabase の URL と Service Role Key を取得
// ---------------------------------------------------------

// Supabase プロジェクトの URL（例: https://xxxxx.supabase.co）
// Deno.env.get() で環境変数を読む（Edge Functions でも同じ）
const supabaseUrl = Deno.env.get("SUPABASE_URL");

// Supabase の Service Role Key（超強い権限を持つ秘密鍵）
// このキーは絶対にフロントエンドに公開してはいけない。
// サーバ側でのみ利用することで、DB の Insert / Update / Delete が自由にできる。
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// ---------------------------------------------------------
// 2. 必須の環境変数が入っていなければアプリ起動を止める
// ---------------------------------------------------------

// URL またはキーが欠けていたら、起動しても意味がないので即エラーを投げて停止。
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
}

// ---------------------------------------------------------
// 3. Supabase クライアントを生成してエクスポート
// ---------------------------------------------------------

// createClient(url, service_role_key) を使うと、
// "DB を直接読み書きできる強権限付きの Supabase クライアント" が作られる。
// （普通の anon-key と違って権限が強いので、サーバ専用）
//
// このクライアントを使って、
//   supabase.from("users").insert(...)
//   supabase.from("messages").delete(...)
// などの DB 操作ができる。
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
);

// 以上で、サーバ全体で使える supabase クライアントが完成。