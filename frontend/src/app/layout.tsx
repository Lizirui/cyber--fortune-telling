import type { Metadata } from 'next';
import { Providers } from './providers';
import ProgressBar from '@/components/ProgressBar';
import './globals.css';

export const metadata: Metadata = {
  title: '赛博算命 - AI 祝福 NFT',
  description: '基于 AI 的祝福 NFT 盲盒',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <ProgressBar />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
