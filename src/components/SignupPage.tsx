import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

type UserRole = 'employee' | 'admin';

interface SignupPageProps {
  onSignup: (name: string, email: string, password: string, role: UserRole) => void;
  onBackToLogin: () => void;
}

export default function SignupPage({ onSignup, onBackToLogin }: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('すべての項目を入力してください');
      return;
    }
    setError('');
    onSignup(name, email, password, role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-center mb-8">新規ユーザー登録</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田太郎"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label>ユーザー種別</Label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="employee"
                    checked={role === 'employee'}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="mr-2"
                  />
                  社員として登録
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="mr-2"
                  />
                  アドミンとして登録
                </label>
              </div>
            </div>

            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              登録
            </Button>
          </form>

          <div className="mt-6 text-center text-gray-600">
            既にアカウントをお持ちの方は
            <button
              onClick={onBackToLogin}
              className="text-blue-600 hover:underline ml-1"
            >
              こちら
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
