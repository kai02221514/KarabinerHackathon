import { useState } from 'react';
import Header from './Header';
import { type Application } from '../lib/mockData';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
}

interface EmployeeApplicationListProps {
  applications: Application[];
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onViewDetail: (id: string) => void;
  unreadMessagesCount?: number;
}

export default function EmployeeApplicationList({ 
  applications,
  user, 
  onNavigate, 
  onLogout, 
  onViewDetail,
  unreadMessagesCount = 0
}: EmployeeApplicationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // フィルタリング
  const filteredApplications = applications.filter(app => {
    if (!app.isPublished) return false;
    
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userName={user.name} 
        onLogout={onLogout} 
        role="employee" 
        onNavigate={onNavigate}
        currentPage="employee-applications"
        unreadMessagesCount={unreadMessagesCount}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* フィルタエリア */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div>
            <Label htmlFor="search">キーワード検索</Label>
            <Input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="申請名で検索..."
              className="mt-1"
            />
          </div>
        </div>

        {/* 申請リスト */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              該当する申請が見つかりませんでした
            </div>
          ) : (
            <>
              {/* デスクトップ: テーブル表示 */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700">申請名</th>
                      <th className="px-6 py-3 text-left text-gray-700">提出方法</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app, index) => (
                      <tr
                        key={app.id}
                        onClick={() => onViewDetail(app.id)}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          index !== filteredApplications.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                      >
                        <td className="px-6 py-4">{app.name}</td>
                        <td className="px-6 py-4 text-gray-600">{app.submissionMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* モバイル: カード表示 */}
              <div className="md:hidden">
                {filteredApplications.map((app, index) => (
                  <div
                    key={app.id}
                    onClick={() => onViewDetail(app.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      index !== filteredApplications.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <div className="mb-2">{app.name}</div>
                    <div className="text-gray-600">{app.submissionMethod}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}