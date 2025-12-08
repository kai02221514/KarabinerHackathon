import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js"; // Supabase クライアント作成用

const supabaseUrl = Deno.env.get("SUPABASE_URL"); // Supabase の URL（環境変数）
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); // サービスロールキー（環境変数）

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // どちらかが欠けている場合は即座にエラー
  throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
}

// サービスロール権限で使う Supabase クライアントを生成
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
);
