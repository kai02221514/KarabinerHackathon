import { createClient } from "@supabase/supabase-js"; // Supabase クライアント生成関数
import { publicAnonKey, supabaseUrl } from "./config.ts"; // env から取得した URL とキー

// クライアント SDK（匿名キー）を作成し、フロントの認証に使う
export const supabase = createClient(supabaseUrl, publicAnonKey);
