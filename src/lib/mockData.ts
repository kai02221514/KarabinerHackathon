export interface Application {
  id: string;
  name: string;
  submissionMethod: string;
  submissionUrl: string;
  description: string;
  notes: string;
  isPublished: boolean;
}

export interface UserSubmission {
  id: string;
  applicationId: string;
  userId: string;
  status: "pending" | "submitted";
  submittedAt: string | null;
}

export interface MyApplicationItem {
  id: string;
  applicationId: string;
  userId: string;
  title: string;
  memo: string;
  isCompleted: boolean;
  addedAt: string;
  completedAt: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "employee" | "admin";
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export const mockApplications: Application[] = [
  {
    id: "1",
    name: "勤怠報告",
    submissionMethod: "Google Form",
    submissionUrl: "https://forms.google.com/example1",
    description:
      "月次の勤怠報告を提出してください。出勤日数、休暇取得状況などを入力します。",
    notes:
      "毎月25日までに必ず提出してください。遅延すると給与計算に影響する可能性があります。",
    isPublished: true,
  },
  {
    id: "2",
    name: "有給休暇申請",
    submissionMethod: "Slack",
    submissionUrl: "https://slack.com/example-channel",
    description:
      "有給休暇を取得する場合は、#人事チャンネルで申請してください。",
    notes: "希望日の5営業日前までに申請すること。",
    isPublished: true,
  },
  {
    id: "3",
    name: "経費精算",
    submissionMethod: "Notion",
    submissionUrl: "https://notion.so/example-expense",
    description: "業務で発生した経費を精算します。領収書の添付が必要です。",
    notes: "経費発生月の翌月20日までに申請してください。",
    isPublished: true,
  },
  {
    id: "4",
    name: "備品購入申請",
    submissionMethod: "メール",
    submissionUrl: "mailto:soumu@company.com",
    description: "業務で必要な備品の購入申請をします。",
    notes: "5万円以上の場合は部門長の承認が必要です。",
    isPublished: true,
  },
  {
    id: "5",
    name: "住所変更届",
    submissionMethod: "Google Form",
    submissionUrl: "https://forms.google.com/example2",
    description: "住所が変更になった場合は速やかに届け出てください。",
    notes: "変更後2週間以内に提出すること。",
    isPublished: true,
  },
  {
    id: "6",
    name: "年末調整書類",
    submissionMethod: "Google Form",
    submissionUrl: "https://forms.google.com/example3",
    description: "年末調整に必要な書類を提出してください。",
    notes: "控除証明書などの添付書類も忘れずに。",
    isPublished: true,
  },
  {
    id: "7",
    name: "出張申請",
    submissionMethod: "Slack",
    submissionUrl: "https://slack.com/soumu-channel",
    description: "出張が必要な場合は事前に申請してください。",
    notes: "出張日の1週間前までに申請すること。",
    isPublished: true,
  },
  {
    id: "8",
    name: "健康診断結果提出",
    submissionMethod: "メール",
    submissionUrl: "mailto:health@company.com",
    description: "健康診断を受診した結果を提出してください。",
    notes: "受診後1ヶ月以内に提出すること。",
    isPublished: true,
  },
];

export const mockSubmissions: UserSubmission[] = [
  {
    id: "1",
    applicationId: "1",
    userId: "1",
    status: "submitted",
    submittedAt: "2025-11-15",
  },
  {
    id: "2",
    applicationId: "3",
    userId: "1",
    status: "pending",
    submittedAt: null,
  },
  {
    id: "3",
    applicationId: "6",
    userId: "1",
    status: "pending",
    submittedAt: null,
  },
];

export const mockMyApplicationItems: MyApplicationItem[] = [
  {
    id: "1",
    applicationId: "1",
    userId: "1",
    title: "11月の勤怠報告",
    memo: "出勤日数と休暇取得状況を確認してください。",
    isCompleted: true,
    addedAt: "2025-11-01",
    completedAt: "2025-11-15",
  },
  {
    id: "2",
    applicationId: "3",
    userId: "1",
    title: "経費精算",
    memo: "領収書を添付してください。",
    isCompleted: false,
    addedAt: "2025-11-01",
    completedAt: null,
  },
  {
    id: "3",
    applicationId: "6",
    userId: "1",
    title: "年末調整書類",
    memo: "控除証明書を添付してください。",
    isCompleted: false,
    addedAt: "2025-11-01",
    completedAt: null,
  },
];

export const mockUserProfiles: UserProfile[] = [
  {
    id: "1",
    name: "山田太郎",
    email: "yamada@company.com",
    role: "employee",
  },
  {
    id: "2",
    name: "佐藤花子",
    email: "sato@company.com",
    role: "employee",
  },
  {
    id: "3",
    name: "鈴木一郎",
    email: "suzuki@company.com",
    role: "employee",
  },
  {
    id: "4",
    name: "田中次郎",
    email: "tanaka@company.com",
    role: "employee",
  },
  {
    id: "admin1",
    name: "管理者",
    email: "admin@company.com",
    role: "admin",
  },
];

export const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "admin1",
    receiverId: "1",
    content:
      "勤怠報告の提出期限が近づいています。お忘れなく提出をお願いします。",
    sentAt: "2025-11-20T10:30:00",
    isRead: true,
  },
  {
    id: "2",
    senderId: "1",
    receiverId: "admin1",
    content: "承知しました。本日中に提出いたします。",
    sentAt: "2025-11-20T11:00:00",
    isRead: true,
  },
  {
    id: "3",
    senderId: "admin1",
    receiverId: "1",
    content: "ありがとうございます。よろしくお願いします。",
    sentAt: "2025-11-20T11:15:00",
    isRead: false,
  },
  {
    id: "4",
    senderId: "admin1",
    receiverId: "2",
    content: "経費精算の領収書に不備がありました。再提出をお願いします。",
    sentAt: "2025-11-25T14:00:00",
    isRead: false,
  },
  {
    id: "5",
    senderId: "admin1",
    receiverId: "3",
    content: "年末調整の書類を確認しました。ありがとうございました。",
    sentAt: "2025-11-28T16:30:00",
    isRead: false,
  },
];
