'use client';

import Link from 'next/link';
import { ConnectWallet } from './ConnectWallet';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-cyber-primary">
          赛博算命
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-white hover:text-cyber-primary transition-colors">
            首页
          </Link>
          <Link href="/market" className="text-white hover:text-cyber-primary transition-colors">
            市场
          </Link>
          <Link href="/profile" className="text-white hover:text-cyber-primary transition-colors">
            我的
          </Link>
          <ConnectWallet />
        </nav>
      </div>
    </header>
  );
}
