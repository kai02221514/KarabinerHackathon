-- ============================================================
-- 1. ユーザープロファイルテーブル
--    - Supabase Auth (auth.users) と 1対1 の拡張テーブル
-- ============================================================

create table if not exists public.users (
  -- Supabase Auth のユーザーID（UUID）
  id uuid primary key
    references auth.users (id) on delete cascade,

  -- 表示名
  name text not null,

  -- メールアドレス（Auth と揃えておく想定）
  email text not null unique,

  -- ロール（admin / employee）
  role text not null
    check (role in ('admin', 'employee')),

  -- 作成日時
  created_at timestamptz not null default now()
);

create index if not exists users_email_idx
  on public.users (email);



-- ============================================================
-- 2. 申請種別テーブル（applications）
--    - 「勤怠報告」「有給休暇申請」などのマスタ
-- ============================================================

create table if not exists public.applications (
  -- アプリケーションID（例: 'app_1', 'app_1712482342342'）
  id text primary key,

  -- 名称（勤怠報告、有給休暇申請など）
  name text not null,

  -- 提出方法（Google Form / Slack / Notion / メール など）
  submission_method text not null,

  -- 申請先URL（フォームURL / Slack チャンネルURL / mailto: など）
  submission_url text not null,

  -- 説明文
  description text not null,

  -- 補足・注意事項（任意）
  notes text,

  -- 社員向けに公開されているかどうか
  is_published boolean not null default false,

  -- 作成・更新日時
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 自動更新用トリガ（任意）
create or replace function public.set_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp_updated_at_applications
  on public.applications;

create trigger set_timestamp_updated_at_applications
before update on public.applications
for each row
execute function public.set_timestamp_updated_at();



-- ============================================================
-- 3. マイ申請テーブル（my_applications）
--    - 各ユーザーが自分用に管理する申請リスト
-- ============================================================

create table if not exists public.my_applications (
  -- マイ申請ID（例: 'item_1712482342342'）
  id text primary key,

  -- ユーザーID（public.users.id / auth.users.id）
  user_id uuid not null
    references public.users (id) on delete cascade,

  -- 対応する applications.id
  application_id text not null
    references public.applications (id) on delete cascade,

  -- ユーザーが付けるタイトル（任意のメモ的タイトル）
  title text not null,

  -- メモ（任意）
  memo text,

  -- 完了済みかどうか
  is_completed boolean not null default false,

  -- 追加日時（バックエンドから ISO 文字列で入る想定）
  added_at timestamptz not null,

  -- 完了日時（未完了なら NULL）
  completed_at timestamptz
);

-- よく使いそうなクエリのためのインデックス
create index if not exists my_applications_user_id_added_at_idx
  on public.my_applications (user_id, added_at);

create index if not exists my_applications_application_id_idx
  on public.my_applications (application_id);



-- ============================================================
-- 4. メッセージテーブル（messages）
--    - ユーザー間の簡易メッセージング
-- ============================================================

create table if not exists public.messages (
  -- メッセージID（例: 'msg_1712482342342'）
  id text primary key,

  -- 送信者
  sender_id uuid not null
    references public.users (id) on delete cascade,

  -- 受信者
  receiver_id uuid not null
    references public.users (id) on delete cascade,

  -- 本文
  content text not null,

  -- 送信日時（バックエンドから ISO 文字列で入る想定）
  sent_at timestamptz not null,

  -- 既読フラグ
  is_read boolean not null default false
);

create index if not exists messages_sender_id_idx
  on public.messages (sender_id, sent_at);

create index if not exists messages_receiver_id_idx
  on public.messages (receiver_id, sent_at);