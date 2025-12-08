// システム内で扱うロールの種類
export type Role = "admin" | "employee";

// Supabase users テーブルのプロファイル表現
export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

// applications テーブルを API で扱う型
export type Application = {
  id: string;
  name: string;
  submissionMethod: string;
  submissionUrl: string;
  description: string;
  notes?: string | null;
  isPublished: boolean;
};

// my_applications テーブルを API で扱う型
export type MyApplicationItem = {
  id: string;
  applicationId: string;
  userId: string;
  title: string;
  memo?: string | null;
  isCompleted: boolean;
  addedAt: string;
  completedAt: string | null;
};

// messages テーブルを API で扱う型
export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
};
