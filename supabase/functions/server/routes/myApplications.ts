// Hono 本体（ルーターを作るためのクラス）を npm からインポート
import { Hono } from "npm:hono"; // ルーター作成用

// Supabase にアクセスするための事前定義済みクライアントをインポート
import { supabase } from "../config/supabaseClient.ts"; // Supabase クライアント

// すべての API パスの頭につける共通プレフィックス（例: "/make-server-f1e05698"）をインポート
import { API_PREFIX } from "../constants.ts"; // API パスのプレフィックス

// 認証トークン（Authorization ヘッダ）からユーザー情報を取得するヘルパー関数をインポート
import { authenticate } from "../lib/auth.ts"; // 認証ヘルパー

// DB の行データ（my_applications の1レコード）を、フロントに返す形に変換する関数をインポート
import { mapMyApplicationRow } from "../lib/mappers.ts"; // DB 行 → API 変換

// my_applications 関連のエンドポイント専用の Hono ルーターインスタンスを生成
export const myApplicationRoutes = new Hono(); // このオブジェクトに対して GET/POST などのルートを定義していく

// ========================
// マイ申請一覧取得
// ========================

// HTTP GET /{API_PREFIX}/my-applications に対応するエンドポイントを定義
myApplicationRoutes.get(`${API_PREFIX}/my-applications`, async (c) => {
  // リクエストヘッダの Authorization からユーザー認証を行う
  const user = await authenticate(c.req.header("Authorization") ?? null); // 認証確認

  // 認証に失敗した場合は 401 Unauthorized を返す
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401); // 未認証
  }

  // Supabase の my_applications テーブルから
  // 現在ログインしているユーザーのレコードのみを選択するクエリを実行
  const { data, error } = await supabase
    .from("my_applications") // 操作対象テーブルを指定
    .select("*") // すべてのカラムを取得
    .eq("user_id", user.id) // user_id がログインユーザーのものに一致する行のみ
    .order("added_at", { ascending: true }); // 追加日時の昇順で並べる

  // DB アクセスでエラーが発生した場合はログ出力し、500 Internal Server Error を返す
  if (error) {
    console.log("My applications list error:", error);
    return c.json({ error: "Internal error" }, 500);
  }

  // data が null の可能性があるので空配列でフォールバックしつつ map する
  const items = (data ?? []).map(mapMyApplicationRow); // 各行を API レスポンス用の形に変換

  // 変換済み items を JSON としてクライアントに返却
  return c.json({ items });
});

// ========================
// マイ申請追加
// ========================

// HTTP POST /{API_PREFIX}/my-applications に対応
myApplicationRoutes.post(`${API_PREFIX}/my-applications`, async (c) => {
  // 認証ヘッダからユーザー情報を取得
  const user = await authenticate(c.req.header("Authorization") ?? null); // 認証確認

  // 認証されていなければ 401 を返す
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // リクエストボディ（JSON）をパース
    // 期待しているフィールド: applicationId, title, memo
    const { applicationId, title, memo } = await c.req.json(); // リクエストボディ取得

    // 新しい my_applications レコードの ID を時刻ベースで生成
    const itemId = `item_${Date.now()}`; // 一意な ID を生成

    // 現在時刻を ISO 文字列で取得し、追加日時として保存する
    const addedAt = new Date().toISOString(); // 追加日時を作成

    // DB my_applications テーブルに挿入するためのデータオブジェクトを構築
    const insertData = {
      id: itemId, // 主キー
      user_id: user.id, // ログイン中のユーザーID
      application_id: applicationId, // 紐付く申請種別（applications.id）
      title, // ユーザーがつけるタイトル
      memo: memo ?? null, // メモ、省略された場合は null
      is_completed: false, // 追加時点では未完了扱い
      added_at: addedAt, // 追加日時
      completed_at: null, // 完了日時はまだないので null
    };

    // Supabase に対して insert を実行し、挿入後の行を1件取得
    const { data, error } = await supabase
      .from("my_applications")
      .insert(insertData)
      .select("*")
      .maybeSingle(); // 1件のみ返ってくる想定

    // 挿入に失敗した、またはデータが返ってこなかった場合
    if (error || !data) {
      console.log("Add to my applications error:", error);
      return c.json({ error: "Failed to add item" }, 500);
    }

    // DB 行をフロントエンド用の形式に変換
    const item = mapMyApplicationRow(data);

    // 作成された item を JSON として返す
    return c.json({ item });
  } catch (error) {
    // try ブロック内で例外が起きた場合のハンドリング
    console.log("Add to my applications error:", error);
    return c.json({ error: "Failed to add item" }, 500);
  }
});

// ========================
// マイ申請更新
// ========================

// HTTP PUT /{API_PREFIX}/my-applications/:id に対応
myApplicationRoutes.put(`${API_PREFIX}/my-applications/:id`, async (c) => {
  // 認証ヘッダからユーザー情報を取得
  const user = await authenticate(c.req.header("Authorization") ?? null); // 認証確認

  // 認証されていない場合は 401
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // URL パラメータから itemId を取得
    const itemId = c.req.param("id"); // パスから ID 取得

    // リクエストボディを JSON として取得
    // ここには title / memo / isCompleted / addedAt / completedAt などが入る想定
    const updates = await c.req.json(); // リクエストボディ取得

    // DB 側のカラム名に合わせて更新内容を詰め直すためのオブジェクト
    const dbUpdates: any = {}; // DB に合わせた更新データ

    // それぞれのフィールドが送られてきた場合のみ DB 更新対象に含める
    if ("title" in updates) dbUpdates.title = updates.title;
    if ("memo" in updates) dbUpdates.memo = updates.memo;
    if ("isCompleted" in updates)
      dbUpdates.is_completed = !!updates.isCompleted;
    if ("addedAt" in updates) dbUpdates.added_at = updates.addedAt;
    if ("completedAt" in updates) dbUpdates.completed_at = updates.completedAt;

    // Supabase で更新クエリを実行
    const { data, error } = await supabase
      .from("my_applications")
      .update(dbUpdates)
      .eq("id", itemId) // 主キーが一致
      .eq("user_id", user.id) // かつ自分のレコードのみ
      .select("*")
      .maybeSingle();

    // 更新に失敗した、もしくは行が見つからなかった場合
    if (error || !data) {
      console.log("Update my application error:", error);
      return c.json({ error: "Failed to update item" }, 500);
    }

    // 取得した行を API 用に整形
    const item = mapMyApplicationRow(data);

    // 更新済みの item を返却
    return c.json({ item });
  } catch (error) {
    // 予期せぬ例外発生時のログとエラーレスポンス
    console.log("Update my application error:", error);
    return c.json({ error: "Failed to update item" }, 500);
  }
});

// ========================
// マイ申請削除
// ========================

// HTTP DELETE /{API_PREFIX}/my-applications/:id に対応
myApplicationRoutes.delete(`${API_PREFIX}/my-applications/:id`, async (c) => {
  // 認証ヘッダからユーザー情報を取得
  const user = await authenticate(c.req.header("Authorization") ?? null); // 認証確認

  // 認証されていない場合は 401
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // URL パラメータから削除対象の itemId を取得
    const itemId = c.req.param("id"); // パスから ID 取得

    // Supabase に対して delete クエリを発行
    const { error } = await supabase
      .from("my_applications")
      .delete()
      .eq("id", itemId)
      .eq("user_id", user.id); // 自分のレコードに限定

    // 削除時にエラーになった場合
    if (error) {
      console.log("Delete my application error:", error);
      return c.json({ error: "Failed to delete item" }, 500);
    }

    // 正常終了時は { success: true } だけ返す
    return c.json({ success: true });
  } catch (error) {
    // 予期せぬ例外に対するログとエラーレスポンス
    console.log("Delete my application error:", error);
    return c.json({ error: "Failed to delete item" }, 500);
  }
});
