import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cyber-bg cyber-grid-bg flex flex-col items-center justify-center relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-cyber-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-cyber-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* 404 数字 */}
      <div className="relative z-10 text-center">
        <div className="text-[150px] md:text-[200px] font-bold leading-none cyber-glitch mb-2" data-text="404">
          404
        </div>

        {/* 装饰线 */}
        <div className="w-32 h-1 bg-linear-to-r from-transparent via-cyber-primary to-transparent mx-auto mb-6" />

        <p className="text-xl md:text-2xl text-gray-400 mb-8 tracking-wider">
          This page could not be found
        </p>

        {/* 回到主页按钮 */}
        <Link
          href="/"
          className="cyber-btn px-8 py-4 inline-block text-lg font-semibold"
        >
          ← 回到主页
        </Link>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cyber-primary/30 text-sm">
        <span className="inline-block w-2 h-2 bg-cyber-primary rounded-full animate-pulse mr-2" />
        SYSTEM ERROR: ROUTE NOT FOUND
        <span className="inline-block w-2 h-2 bg-cyber-primary rounded-full animate-pulse ml-2" />
      </div>
    </div>
  );
}
