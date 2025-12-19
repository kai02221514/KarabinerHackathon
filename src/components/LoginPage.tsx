import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onSignup: () => void;
}

export default function LoginPage({ onLogin, onSignup }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }
    setError("");
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-center mb-8">申請ポータル</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="パスワードを入力"
              />
            </div>

            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
            )}

            <Button type="submit" className="w-full">
              ログイン
            </Button>
          </form>

          <div className="mt-6 text-center text-gray-600">
            アカウントをお持ちでない方は
            <button
              onClick={onSignup}
              className="text-blue-600 hover:underline ml-1"
            >
              こちら
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded text-blue-900">
            <p className="mb-2">デモ用アカウント：</p>
            <p>社員: employee@company.com</p>
            <p>アドミン: admin@company.com</p>
            <p>パスワード: 任意</p>
          </div>
        </div>
      </div>
    </div>
  );
}
