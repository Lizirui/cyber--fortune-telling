"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectWallet } from "./ConnectWallet";
import { useAccount } from "wagmi";

export function Header() {
  const { isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/market", label: "交易市场" },
    { href: "/profile", label: "个人中心" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-cyber-primary/20">
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-3 flex items-center justify-between">
        {/* Logo + 导航（桌面端） */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link
            href="/"
            className="text-lg md:text-2xl font-bold text-cyber-primary relative group flex-shrink-0"
          >
            <span className="relative z-10">赛博算命</span>
            <span className="absolute inset-0 bg-cyber-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-gray-400 hover:text-cyber-primary transition-all relative group"
              >
                <span className="relative z-10">{item.label}</span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-cyber-primary group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>
        </div>

        {/* 桌面端右侧按钮 - 仅连接后显示地址和断开按钮 */}
        <div className="hidden md:flex items-center gap-3">
          {isConnected && <ConnectWallet />}
        </div>

        {/* 移动端：汉堡菜单 */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-cyber-primary"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* 移动端菜单 - 全屏下拉菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#050508] border-b border-cyber-primary/20">
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-4 text-gray-400 hover:text-cyber-primary hover:bg-cyber-primary/5 transition-all border-b border-gray-800/30"
              >
                {item.label}
              </Link>
            ))}
            {/* 移动端：连接后显示地址和断开按钮 */}
            {isConnected && (
              <div className="p-4">
                <ConnectWallet />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
