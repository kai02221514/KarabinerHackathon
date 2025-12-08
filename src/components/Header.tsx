import { Button } from "./ui/button";
import { Menu, X, Bell } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  userName: string;
  onLogout: () => void;
  role: "employee" | "admin";
  onNavigate: (page: string) => void;
  currentPage?: string;
  unreadMessagesCount?: number;
}

export default function Header({
  userName,
  onLogout,
  role,
  onNavigate,
  currentPage,
  unreadMessagesCount = 0,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-50">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            {/* Mobile Page Title */}
            <div className="md:hidden text-gray-900">
              {role === "employee" && (
                <>
                  {(currentPage === "employee-home" || !currentPage) &&
                    "ホーム"}
                  {currentPage === "employee-applications" && "申請一覧"}
                  {currentPage === "employee-my-applications" && "マイ申請"}
                  {currentPage === "employee-messages" && "メッセージ"}
                  {currentPage === "employee-message-detail" &&
                    "メッセージ詳細"}
                </>
              )}
              {role === "admin" && (
                <>
                  {(currentPage === "admin-home" || !currentPage) && "ホーム"}
                  {currentPage === "admin-forms" && "フォーム管理"}
                  {currentPage === "admin-users" && "メッセージ"}
                  {currentPage === "admin-user-chat" && "ユーザーチャット"}
                </>
              )}
            </div>

            {/* Desktop Navigation */}
            {role === "employee" && (
              <nav className="hidden md:flex gap-6">
                <button
                  onClick={() => onNavigate("employee-home")}
                  className={` ${
                    currentPage === "employee-home" || !currentPage
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  ホーム
                </button>
                <button
                  onClick={() => onNavigate("employee-applications")}
                  className={` ${
                    currentPage === "employee-applications"
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  申請一覧
                </button>
                <button
                  onClick={() => onNavigate("employee-my-applications")}
                  className={` ${
                    currentPage === "employee-my-applications"
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  マイ申請
                </button>
              </nav>
            )}

            {role === "admin" && (
              <nav className="hidden md:flex gap-6">
                <button
                  onClick={() => onNavigate("admin-home")}
                  className={` ${
                    currentPage === "admin-home" || !currentPage
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  ホーム
                </button>
                <button
                  onClick={() => onNavigate("admin-forms")}
                  className={` ${
                    currentPage === "admin-forms"
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  フォーム管理
                </button>
                <button
                  onClick={() => onNavigate("admin-users")}
                  className={` ${
                    currentPage === "admin-users" ||
                    currentPage === "admin-user-chat"
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  メッセージ
                </button>
              </nav>
            )}
          </div>

          {/* Desktop User Info */}
          <div className="hidden md:flex items-center gap-4">
            {role === "employee" && (
              <button
                onClick={() => onNavigate("employee-messages")}
                className="relative p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-700" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                  </span>
                )}
              </button>
            )}
            <Button variant="outline" onClick={onLogout}>
              ログアウト
            </Button>
          </div>

          {/* Mobile Right Side */}
          <div className="md:hidden flex items-center gap-2">
            {role === "employee" && (
              <button
                onClick={() => onNavigate("employee-messages")}
                className="relative p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-700" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                  </span>
                )}
              </button>
            )}
            {/* Mobile Hamburger Button */}
            <button
              className="p-2 relative"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-700" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700" />
                )}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Mobile Menu */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-16 left-0 right-0 bg-white shadow-lg z-50 md:hidden overflow-y-auto max-h-[calc(100vh-4rem)]"
              >
                <div className="p-4">
                  {role === "employee" && (
                    <nav className="flex flex-col gap-4">
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                        onClick={() => {
                          onNavigate("employee-home");
                          setIsMobileMenuOpen(false);
                        }}
                        className={`text-left py-2 text-gray-700 hover:text-gray-900 ${
                          currentPage === "employee-home" ? "text-blue-600" : ""
                        }`}
                      >
                        ホーム
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => {
                          onNavigate("employee-applications");
                          setIsMobileMenuOpen(false);
                        }}
                        className={`text-left py-2 text-gray-700 hover:text-gray-900 ${
                          currentPage === "employee-applications"
                            ? "text-blue-600"
                            : ""
                        }`}
                      >
                        申請一覧
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => {
                          onNavigate("employee-my-applications");
                          setIsMobileMenuOpen(false);
                        }}
                        className={`text-left py-2 text-gray-700 hover:text-gray-900 ${
                          currentPage === "employee-my-applications"
                            ? "text-blue-600"
                            : ""
                        }`}
                      >
                        マイ申請
                      </motion.button>
                    </nav>
                  )}

                  {role === "admin" && (
                    <nav className="flex flex-col gap-4">
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                        onClick={() => {
                          onNavigate("admin-home");
                          setIsMobileMenuOpen(false);
                        }}
                        className={`text-left py-2 text-gray-700 hover:text-gray-900 ${
                          currentPage === "admin-home" ? "text-blue-600" : ""
                        }`}
                      >
                        ホーム
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => {
                          onNavigate("admin-forms");
                          setIsMobileMenuOpen(false);
                        }}
                        className={`text-left py-2 text-gray-700 hover:text-gray-900 ${
                          currentPage === "admin-forms" ? "text-blue-600" : ""
                        }`}
                      >
                        フォーム管理
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => {
                          onNavigate("admin-users");
                          setIsMobileMenuOpen(false);
                        }}
                        className={`text-left py-2 text-gray-700 hover:text-gray-900 ${
                          currentPage === "admin-users" ||
                          currentPage === "admin-user-chat"
                            ? "text-blue-600"
                            : ""
                        }`}
                      >
                        メッセージ
                      </motion.button>
                    </nav>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col gap-4 mt-4 pt-4 border-t border-gray-200"
                  >
                    <Button
                      variant="outline"
                      onClick={onLogout}
                      className="w-full"
                    >
                      ログアウト
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
