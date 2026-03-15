import { Header } from "@/components/Header";
import { MintBox } from "@/components/MintBox";

export default function Home() {
  return (
    <div className="min-h-screen bg-cyber-bg cyber-grid-bg cyber-radial-glow relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-cyber-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-cyber-secondary/5 rounded-full blur-3xl" />
      </div>

      <Header />
      <main className="pt-16 md:pt-20 pb-8 md:pb-12 relative z-10">
        {/* Hero Section */}
        <section className="text-center py-12 md:py-20 relative px-4">
          <div className="inline-block relative">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold gradient-text mb-3 md:mb-4 tracking-wider">
              赛博算命
            </h1>
          </div>
          <p className="text-base md:text-xl text-gray-400 mb-4 max-w-lg mx-auto px-4">
            AI 生成的祝福 NFT，稀有度由天注定
          </p>
          <div className="flex items-center justify-center gap-2 text-cyber-primary/60 text-xs md:text-sm">
            <span className="inline-block w-2 h-2 bg-cyber-primary rounded-full animate-pulse" />
            <span>基于区块链的命运抽取</span>
            <span className="inline-block w-2 h-2 bg-cyber-primary rounded-full animate-pulse" />
          </div>
        </section>

        {/* Mint Section */}
        <section className="max-w-2xl mx-auto px-3 md:px-4 mb-12 md:mb-20">
          <MintBox />
        </section>
      </main>
    </div>
  );
}
