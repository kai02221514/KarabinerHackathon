// Hono 本体（ルーターを作るためのクラス）を npm からインポート
import { Hono } from "npm:hono"; // ルーター作成用

// Supabase に接続するための共通クライアントをインポート
import { supabase } from "../config/supabaseClient.ts"; // Supabase クライアント

// API のパスの先頭につける共通プレフィックス（例: "/make-server-f1e05698"）をインポート
import { API_PREFIX } from "../constants.ts"; // API パスのプレフィックス

// 認証トークンからユーザーを取得する関数と、ユーザープロファイルを取得する関数をインポート
import { authenticate, getUserProfile } from "../lib/auth.ts"; // 認証・プロフィール取得ヘルパー

// DB の applications 行 → フロントに返す Application 形式に変換するマッパー関数
import { mapApplicationRow } from "../lib/mappers.ts"; // DB 行 → API 変換

// アプリケーションの型定義（API レスポンス用の構造）
import type { Application } from "../types.ts"; // 型定義

// ========================
// applications 関連ルーター
// ========================

// アプリケーション（申請種別）に関するエンドポイントをまとめるための Hono ルーターを作成
export const applicationRoutes = new Hono();

// ========================
// アプリケーション一覧取得
// ========================

// HTTP GET /{API_PREFIX}/applications に対応するエンドポイントを定義
applicationRoutes.get(`${API_PREFIX}/applications`, async (c) => {
  // リクエストヘッダの Authorization を取り出し、認証処理に渡す
  const user = await authenticate(c.req.header("Authorization") ?? null); // 認証確認

  // 認証に失敗した場合は 401 Unauthorized を返す
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401); // 未認証
  }

  try {
    // ユーザーIDから、プロフィール情報（role 等）を取得
    const profile = await getUserProfile(user.id); // プロファイル取得
    if (!profile) {
      // プロファイルが見つからない場合は 404
      return c.json({ error: "User not found" }, 404);
    }

    // ユーザーが「employee」であれば従業員扱い
    // 従業員は公開済みアプリケーションのみ見える仕様
    const isEmployee = profile.role === "employee"; // 従業員なら公開分のみ

    // applications テーブルの全件を対象にしたクエリを組み立て
    let query = supabase.from("applications").select("*"); // 全件クエリ開始

    // 従業員の場合は is_published = true のレコードに絞り込む
    if (isEmployee) {
      query = query.eq("is_published", true); // 従業員は公開 flag で絞る
    }

    // 上で組み立てたクエリに対して created_at 昇順で並び替えを指定して実行
    const { data, error } = await query.order("created_at", {
      ascending: true,
    }); // 作成日時順で取得

    // クエリ実行時にエラーが発生した場合
    if (error) {
      console.log("Applications list error:", error);
      return c.json({ error: "Internal error" }, 500);
    }

    // data が null の場合は空配列にフォールバックしつつ、各行を API 用の形に変換
    const applications = (data ?? []).map(mapApplicationRow); // レスポンス用に整形

    // 変換済みの applications を JSON として返却
    return c.json({ applications });
  } catch (err) {
    // 想定外の例外をキャッチしてログに出し、500 を返す
    console.log("Applications list unexpected error:", err);
    return c.json({ error: "Internal error" }, 500);
  }
});

// ========================
// アプリケーション詳細取得
// ========================

// HTTP GET /{API_PREFIX}/applications/:id に対応するエンドポイントを定義
applicationRoutes.get(`${API_PREFIX}/applications/:id`, async (c) => {
  // Authorization ヘッダからユーザーを認証
  const user = await authenticate(c.req.header("Authorization") ?? null); // 認証確認

  // 未認証の場合は 401 を返す
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // ルートパラメータからアプリケーションID（:id の部分）を取得
  const id = c.req.param("id"); // パスから ID 取得

  // applications テーブルから、指定された id のレコードを1件取得
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle(); // 単一行を取得（なければ null）

  // クエリ時にエラーが出た場合
  if (error) {
    console.log("Application detail error:", error);
    return c.json({ error: "Internal error" }, 500);
  }

  // レコードが見つからない場合は 404 Not Found を返す
  if (!data) {
    return c.json({ error: "Application not found" }, 404); // 未存在
  }

  // 見つかったレコードを mapApplicationRow で変換して返す
  return c.json({ application: mapApplicationRow(data) }); // 整形して返却
});

// ========================
// アプリケーション作成・更新（アドミンのみ）
// ========================

// HTTP POST /{API_PREFIX}/applications に対応
// - body に id があれば更新、なければ新規作成として扱う
applicationRoutes.post(`${API_PREFIX}/applications`, async (c) => {
  // Authorization ヘッダからユーザー情報を取得
  const user = await authenticate(c.req.header("Authorization") ?? null); // 認証確認

  // 未認証なら 401
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // ユーザープロファイルを取得してロールを確認
    const profile = await getUserProfile(user.id); // プロファイル取得
    if (!profile) {
      return c.json({ error: "User not found" }, 404);
    }
    // ロールが admin 以外なら 403 Forbidden
    if (profile.role !== "admin") {
      return c.json({ error: "Forbidden" }, 403); // 管理者以外は拒否
    }

    // リクエストボディを JSON として取得
    const body = await c.req.json(); // リクエストボディ取得

    // ボディから必要なフィールドを取り出す
    const {
      id, // 既存アプリケーションID（更新時に使用）
      name, // 申請名称
      submissionMethod, // 提出方法（例: "Google Form"）
      submissionUrl, // 提出先 URL
      description, // 説明文
      notes, // 補足
      isPublished, // 公開フラグ
    } = body as any;

    // id が指定されていない場合は、新規用のIDを生成
    const applicationId = id ?? `app_${Date.now()}`; // ID がない場合は生成

    // DB applications テーブル用にカラム名を変換しながら upsert データを組み立て
    const upsertData = {
      id: applicationId, // 主キー
      name, // 名前
      submission_method: submissionMethod, // DB 側のカラム（snake_case）
      submission_url: submissionUrl, // DB 側カラム
      description, // 説明文
      notes: notes ?? null, // notes は null 許容
      is_published: !!isPublished, // boolean に正規化
    }; // DB 用のカラム名に変換

    // Supabase で upsert を実行
    // - id が既に存在すれば更新
    // - なければ新規作成
    const { error } = await supabase
      .from("applications")
      .upsert(upsertData, { onConflict: "id" }); // upsert で作成 or 更新

    // upsert 時にエラーがあれば 500 を返す
    if (error) {
      console.log("Create/Update application error:", error);
      return c.json({ error: "Failed to save application" }, 500);
    }

    // API レスポンス用の Application 型オブジェクトを作成
    const application: Application = {
      id: applicationId,
      name,
      submissionMethod,
      submissionUrl,
      description,
      notes,
      isPublished: !!isPublished,
    }; // API 返却用の形に整形

    // 作成 or 更新後のアプリケーション情報を JSON として返す
    return c.json({ application });
  } catch (error) {
    // try ブロック全体での予期せぬエラーをキャッチ
    console.log("Create/Update application error:", error);
    return c.json({ error: "Failed to save application" }, 500);
  }
});

// フォーム削除
applicationRoutes.delete(`${API_PREFIX}/applications/:id`, async (c) => {
  const user = await authenticate(c.req.header("Authorization") ?? null); // 認証確認
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    // URL パラメータから削除対象の itemId を取得
    const applicationId = c.req.param("id"); // パスから ID 取得

    // Supabase に対して delete クエリを発行
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", applicationId); // レコード削除

    // 削除時にエラーになった場合
    if (error) {
      console.log("Delete application error:", error);
      return c.json({ error: "Failed to delete application" }, 500);
    }

    // 正常終了時は { success: true } だけ返す
    return c.json({ success: true });
  } catch (error) {
    // 予期せぬ例外に対するログとエラーレスポンス
    console.log("Delete application error:", error);
    return c.json({ error: "Failed to delete application" }, 500);
  }
});