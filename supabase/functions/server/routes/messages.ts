// Hono 本体（ルーターを作るためのクラス）を npm から読み込む
import { Hono } from "npm:hono"; // ルーター作成用

// Supabase に接続するためのクライアント（事前に設定済み）を読み込む
import { supabase } from "../config/supabaseClient.ts"; // Supabase クライアント

// すべての API の先頭につけるパス（例: "/make-server-f1e05698"）を読み込む
import { API_PREFIX } from "../constants.ts"; // API パスのプレフィックス

// Authorization ヘッダからユーザーを特定するための認証ヘルパー関数を読み込む
import { authenticate } from "../lib/auth.ts"; // 認証ヘルパー

// DB の messages テーブルの行 → フロントエンドに返すオブジェクトへ変換する関数を読み込む
import { mapMessageRow } from "../lib/mappers.ts"; // DB 行 → API 変換

// ========================
// messages 関連ルーター
// ========================

// メッセージ関連のエンドポイントをまとめるための Hono ルーターインスタンスを生成
export const messageRoutes = new Hono();

// ========================
// メッセージ一覧取得
// ========================

// HTTP GET /{API_PREFIX}/messages に対応するハンドラを定義
messageRoutes.get(`${API_PREFIX}/messages`, async (c) => {
  // リクエストヘッダから Authorization を取得し、認証ヘルパーに渡してユーザーを特定
  const user = await authenticate(c.req.header("Authorization") ?? null); // 認証確認

  // 認証に失敗していたら 401 Unauthorized を返す
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401); // 未認証
  }

  // Supabase の messages テーブルから
  // 「自分が送信者」または「自分が受信者」のメッセージを取得するクエリを実行
  const { data, error } = await supabase
    .from("messages") // 操作対象テーブルを指定
    .select("*") // すべてのカラムを取得
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`) // 送信 or 受信のどちらかが自分
    .order("sent_at", { ascending: true }); // 時系列（古い順）に並べ替え

  // クエリ実行時にエラーが発生した場合はログを出して 500 を返す
  if (error) {
    console.log("Messages list error:", error);
    return c.json({ error: "Internal error" }, 500);
  }

  // data が null の場合は空配列にフォールバックし、各行を mapMessageRow で整形
  const messages = (data ?? []).map(mapMessageRow); // 整形して返却

  // 整形した messages を JSON としてクライアントに返却
  return c.json({ messages });
});

// ========================
// メッセージ送信
// ========================

// HTTP POST /{API_PREFIX}/messages に対応するハンドラを定義
messageRoutes.post(`${API_PREFIX}/messages`, async (c) => {
  // まず Authorization ヘッダからユーザーを特定
  const user = await authenticate(c.req.header("Authorization") ?? null); // 認証確認

  // 認証されていない場合は 401 を返す
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // リクエストボディを JSON として読み込み
    // 想定しているフィールド: receiverId（受信者 ID）, content（本文）
    const { receiverId, content } = await c.req.json(); // リクエストボディ取得

    // メッセージIDを現在時刻ベースで生成（簡易な一意 ID）
    const messageId = `msg_${Date.now()}`; // 一意な ID を生成

    // 現在時刻を ISO 形式文字列で取得し、送信時刻として保存
    const sentAt = new Date().toISOString(); // 送信時刻

    // messages テーブルに挿入するための行データを構築
    const insertData = {
      id: messageId, // メッセージの主キー
      sender_id: user.id, // 送信者は現在のログインユーザー
      receiver_id: receiverId, // 受信者はリクエストボディから
      content, // メッセージ本文
      sent_at: sentAt, // 送信時刻
      is_read: false, // 新規メッセージなので未読
    };

    // Supabase に対して insert を実行し、挿入された1行を取得
    const { data, error } = await supabase
      .from("messages") // 対象テーブル
      .insert(insertData)
      .select("*")
      .maybeSingle(); // 1 件だけ返ってくる想定

    // 挿入に失敗、もしくは data が空だった場合はエラーとして扱う
    if (error || !data) {
      console.log("Send message error:", error);
      return c.json({ error: "Failed to send message" }, 500);
    }

    // 取得した行を mapMessageRow でフロント向け形式に整形
    const message = mapMessageRow(data);

    // 送信されたメッセージ情報を JSON として返却
    return c.json({ message });
  } catch (error) {
    // try ブロック内の予期せぬエラーをキャッチ
    console.log("Send message error:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// ========================
// メッセージ既読
// ========================

// HTTP PUT /{API_PREFIX}/messages/:id/read に対応するハンドラを定義
messageRoutes.put(`${API_PREFIX}/messages/:id/read`, async (c) => {
  // Authorization ヘッダからユーザー情報を取得
  const user = await authenticate(c.req.header("Authorization") ?? null); // 認証確認

  // 認証されていない場合は 401 を返す
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // URL パラメータからメッセージID（:id の部分）を取得
    const messageId = c.req.param("id"); // パスから ID 取得

    // まず対象メッセージが存在するかどうかを確認するため、1件取得する
    const { data: existing, error: fetchError } = await supabase
      .from("messages")
      .select("*")
      .eq("id", messageId)
      .maybeSingle();

    // 取得時にエラーが発生した場合
    if (fetchError) {
      console.log("Fetch message error:", fetchError);
      return c.json({ error: "Failed to mark as read" }, 500);
    }

    // 該当メッセージが存在しない場合は 404 を返す
    if (!existing) {
      return c.json({ error: "Message not found" }, 404);
    }

    // メッセージの受信者が現在のユーザーではない場合は 403 Forbidden
    if (existing.receiver_id !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    // is_read を true に更新するクエリを実行し、その結果の行を取得
    const { data, error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId)
      .select("*")
      .maybeSingle();

    // 更新時にエラーが発生した、もしくはデータが返らない場合
    if (error || !data) {
      console.log("Mark message as read error:", error);
      return c.json({ error: "Failed to mark as read" }, 500);
    }

    // 更新された行を mapMessageRow でフロント向け形式に整形
    const message = mapMessageRow(data);

    // 既読更新されたメッセージ情報を JSON で返す
    return c.json({ message });
  } catch (error) {
    console.log("Mark message as read error:", error);
    return c.json({ error: "Failed to mark as read" }, 500);
  }
});
