import { Header } from '@/components/Header';

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-cyber-bg cyber-grid-bg relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-48 md:w-80 h-48 md:h-80 bg-cyber-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 md:w-80 h-48 md:h-80 bg-cyber-primary/5 rounded-full blur-3xl" />
      </div>

      <Header />
      <main className="pt-16 md:pt-20 pb-8 md:pb-12 max-w-7xl mx-auto px-3 md:px-4 relative z-10">
        {/* 页面标题 */}
        <div className="mb-6 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2 md:mb-3">市场</h1>
          <p className="text-gray-400 text-sm md:text-base">浏览并购买他人的赛博祝福</p>
        </div>

        {/* Coming Soon */}
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="text-6xl md:text-8xl mb-4">🚧</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Coming Soon</h2>
            <p className="text-gray-400">市场功能正在开发中，敬请期待</p>
          </div>
        </div>
      </main>
    </div>
  );
}
