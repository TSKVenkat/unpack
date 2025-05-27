"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ToastProvider } from "@/components/ui/Toast";
import { FiHome, FiBookmark, FiUser } from "react-icons/fi";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-playfulWhite dark:bg-dark-bg">
        <header className="bg-white dark:bg-dark-card border-b border-playfulGray/10 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-playfulRed dark:text-dark-accent">Un</span>
                pack
              </Link>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <nav className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isActive("/dashboard")
                        ? "text-playfulRed dark:text-dark-accent"
                        : "text-playfulGray dark:text-dark-textSecondary hover:text-playfulBlack dark:hover:text-dark-text"
                    }`}
                  >
                    <FiHome className="w-5 h-5" />
                    <span className="hidden md:inline">Dashboard</span>
                  </Link>
                  <Link
                    href="/bookmarks"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isActive("/bookmarks")
                        ? "text-playfulRed dark:text-dark-accent"
                        : "text-playfulGray dark:text-dark-textSecondary hover:text-playfulBlack dark:hover:text-dark-text"
                    }`}
                  >
                    <FiBookmark className="w-5 h-5" />
                    <span className="hidden md:inline">Bookmarks</span>
                  </Link>
                  <Link
                    href="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isActive("/profile")
                        ? "text-playfulRed dark:text-dark-accent"
                        : "text-playfulGray dark:text-dark-textSecondary hover:text-playfulBlack dark:hover:text-dark-text"
                    }`}
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="hidden md:inline">Profile</span>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </ToastProvider>
  );
}
