// ------------------------------------------------------------
// このファイルは DB から取ってきた「テーブルの raw 行データ」を、
// フロントエンドが使いやすい「アプリ用の型」へ変換するための関数群。
//
// Supabase から返される DB 行は snake_case（例: submission_method）。
// フロントは camelCase（例: submissionMethod）。
//
// そのため「DB 行 → API の型」変換が必要。
// ------------------------------------------------------------

// アプリ側で使う型（Application / Message / MyApplicationItem）を読み込み
import type { Application, Message, MyApplicationItem } from "../types.ts";

// ------------------------------------------------------------
// applications テーブルの行 → Application 型 に整形
// ------------------------------------------------------------

export function mapApplicationRow(row: any): Application {
  return {
    id: row.id, // アプリ ID
    name: row.name, // アプリ名
    submissionMethod: row.submission_method, // DB の snake_case → camelCase に変換
    submissionUrl: row.submission_url, // 同上
    description: row.description, // 説明文
    notes: row.notes, // 備考（NULL の場合あり）
    isPublished: row.is_published, // 公開フラグ（true/false）
  };
}

// ------------------------------------------------------------
// my_applications テーブルの行 → MyApplicationItem 型 に整形
// ------------------------------------------------------------

export function mapMyApplicationRow(row: any): MyApplicationItem {
  return {
    id: row.id, // アイテム固有ID
    applicationId: row.application_id, // どの申請テンプレートのものか
    userId: row.user_id, // 所有者（申請したユーザー）
    title: row.title, // 表示用タイトル
    memo: row.memo, // メモ（NULL の場合あり）
    isCompleted: row.is_completed, // 完了したかどうか
    addedAt: row.added_at, // 追加日時
    completedAt: row.completed_at, // 完了日時（NULL の場合あり）
  };
}

// ------------------------------------------------------------
// messages テーブルの行 → Message 型 に整形
// ------------------------------------------------------------

export function mapMessageRow(row: any): Message {
  return {
    id: row.id, // メッセージ ID
    senderId: row.sender_id, // 送信者のユーザー ID
    receiverId: row.receiver_id, // 受信者のユーザー ID
    content: row.content, // メッセージ本文
    sentAt: row.sent_at, // 送信日時
    isRead: row.is_read, // 既読フラグ
  };
}
