// API の共通プレフィックス
export const API_PREFIX = "/make-server-f1e05698";

// Supabase プロジェクトの URL（必須 env）
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
// Supabase 公開 anon キー（必須 env）
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// VITE_API_BASE_URL があればそれを優先し、なければ Supabase Functions のベースを使う
const apiBaseOverride = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
const supabaseFunctionsBase = `${supabaseUrl}/functions/v1`;
export const API_BASE = (apiBaseOverride ?? supabaseFunctionsBase) + API_PREFIX;
