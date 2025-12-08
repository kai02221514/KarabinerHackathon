import type {
  Application,
  Message,
  MyApplicationItem,
} from "../types.ts"; // 型定義

// applications テーブルの行を API 返却用に整形
export function mapApplicationRow(row: any): Application {
  return {
    id: row.id,
    name: row.name,
    submissionMethod: row.submission_method,
    submissionUrl: row.submission_url,
    description: row.description,
    notes: row.notes,
    isPublished: row.is_published,
  };
}

// my_applications テーブルの行を API 返却用に整形
export function mapMyApplicationRow(row: any): MyApplicationItem {
  return {
    id: row.id,
    applicationId: row.application_id,
    userId: row.user_id,
    title: row.title,
    memo: row.memo,
    isCompleted: row.is_completed,
    addedAt: row.added_at,
    completedAt: row.completed_at,
  };
}

// messages テーブルの行を API 返却用に整形
export function mapMessageRow(row: any): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    content: row.content,
    sentAt: row.sent_at,
    isRead: row.is_read,
  };
}
