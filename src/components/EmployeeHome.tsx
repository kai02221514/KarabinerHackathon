import Header from './Header';
import { type Application, type MyApplicationItem } from '../lib/mockData';
import { Badge } from './ui/badge';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
}

interface EmployeeHomeProps {
  applications: Application[];
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onViewDetail: (id: string) => void;
  myApplicationItems: MyApplicationItem[];
  unreadMessagesCount?: number;
}

export default function EmployeeHome({ applications, user, onNavigate, onLogout, onViewDetail, myApplicationItems, unreadMessagesCount = 0 }: EmployeeHomeProps) {
  // 最近マイ申請に追加した申請を取得
  const recentMyApplications = myApplicationItems
    .filter(item => item.userId === user.id)
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 3)
    .map(item => {
      const app = applications.find(a => a.id === item.applicationId);
      return {
        ...item,
        applicationName: app?.name || '不明な申請'
      };
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userName={user.name} 
        onLogout={onLogout} 
        role="employee" 
        onNavigate={onNavigate}
        currentPage="employee-home"
        unreadMessagesCount={unreadMessagesCount}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 最近追加したマイ申請 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2>最近追加したマイ申請</h2>
            {recentMyApplications.length > 0 && (
              <button
                onClick={() => onNavigate('employee-my-applications')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                すべて見る →
              </button>
            )}
          </div>
          {recentMyApplications.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              まだマイ申請に追加されていません
              <div className="mt-4">
                <button
                  onClick={() => onNavigate('employee-applications')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  申請一覧から探す →
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {recentMyApplications.map((item, index) => {
                return (
                  <div
                    key={item.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      index !== recentMyApplications.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                    onClick={() => onViewDetail(item.applicationId)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="mb-1">{item.title}</div>
                        <div className="text-gray-600 text-sm">
                          追加日: {new Date(item.addedAt).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge variant={item.isCompleted ? 'default' : 'secondary'}>
                          {item.isCompleted ? '完了' : '未完了'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}