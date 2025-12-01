import { useState } from 'react';
import Header from './Header';
import { type Application, type MyApplicationItem } from '../lib/mockData';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Check, ExternalLink } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
}

interface EmployeeMyApplicationsProps {
  applications: Application[];
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onViewDetail: (id: string) => void;
  items: MyApplicationItem[];
  onAddToMyApplications: (applicationId: string, title: string, memo: string) => void;
  onUpdateMyApplications: (items: MyApplicationItem[]) => void;
  unreadMessagesCount?: number;
}

export default function EmployeeMyApplications({ 
  applications,
  user, 
  onNavigate, 
  onLogout, 
  onViewDetail,
  items,
  onAddToMyApplications,
  onUpdateMyApplications,
  unreadMessagesCount = 0
}: EmployeeMyApplicationsProps) {
  const [filter, setFilter] = useState<'all' | 'incomplete' | 'completed'>('all');
  const [completedItems, setCompletedItems] = useState<Set<string>>(
    new Set(items.filter(item => item.isCompleted).map(item => item.id))
  );

  // ユーザーのマイ申請アイテムを取得
  const myItems = items
    .filter(item => item.userId === user.id)
    .map(item => {
      const app = applications.find(a => a.id === item.applicationId);
      return {
        ...item,
        applicationName: app?.name || '不明な申請',
        submissionUrl: app?.submissionUrl || ''
      };
    })
    .sort((a, b) => {
      // 未完了を上に、完了を下に
      if (completedItems.has(a.id) && !completedItems.has(b.id)) return 1;
      if (!completedItems.has(a.id) && completedItems.has(b.id)) return -1;
      // 同じステータスなら追加日時の新しい順
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });

  // フィルタリング
  const filteredItems = myItems.filter(item => {
    const isCompleted = completedItems.has(item.id);
    if (filter === 'incomplete') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    return true;
  });

  const handleToggleComplete = (itemId: string) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
    // 実際のアプリではSupabaseに保存
  };

  const handleOpenSubmissionUrl = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  };

  const incompleteCount = myItems.filter(item => !completedItems.has(item.id)).length;
  const completedCount = myItems.filter(item => completedItems.has(item.id)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userName={user.name} 
        onLogout={onLogout} 
        role="employee" 
        onNavigate={onNavigate}
        currentPage="employee-my-applications"
        unreadMessagesCount={unreadMessagesCount}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* フィルタータブ */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全て ({myItems.length})
            </button>
            <button
              onClick={() => setFilter('incomplete')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'incomplete'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              未完了 ({incompleteCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              完了 ({completedCount})
            </button>
          </div>
        </div>

        {/* 申請カード */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            {filter === 'all' && 'マイ申請に登録された申請がありません'}
            {filter === 'incomplete' && '未完了の申請がありません'}
            {filter === 'completed' && '完了した申請がありません'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isCompleted = completedItems.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg border-2 p-4 transition-all ${
                    isCompleted
                      ? 'border-gray-200 opacity-60'
                      : 'border-blue-200 hover:shadow-md'
                  }`}
                >
                  {/* カードヘッダー */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-2">
                      <h3 className={`mb-1 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {item.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleToggleComplete(item.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {isCompleted && <Check className="h-4 w-4 text-white" />}
                    </button>
                  </div>

                  {/* メモ */}
                  {item.memo && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {item.memo}
                    </p>
                  )}

                  {/* 申請名 */}
                  <div className="mb-3 pb-3 border-b border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">申請フォーム</div>
                    <div className="text-sm">{item.applicationName}</div>
                  </div>

                  {/* アクションボタン */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleOpenSubmissionUrl(item.submissionUrl)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      提出先を開く
                    </Button>
                    <Button
                      onClick={() => onViewDetail(item.applicationId)}
                      variant="ghost"
                      size="sm"
                      className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      申請詳細を見る
                    </Button>
                  </div>

                  {/* 追加日 */}
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    追加日: {new Date(item.addedAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ヒント */}
        {myItems.length === 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900">
              💡 申請一覧から必要な申請を見つけて「マイ申請に追加」ボタンを押すと、ここに表示されます。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}