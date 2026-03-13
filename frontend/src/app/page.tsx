import { Header } from '@/components/Header';
import { MintBox } from '@/components/MintBox';
import { Leaderboard } from '@/components/Leaderboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-cyber-bg">
      <Header />
      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-5xl font-bold text-cyber-primary mb-4">
            赛博算命
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            AI 生成的祝福 NFT，稀有度由天注定
          </p>
        </section>

        {/* Mint Section */}
        <section className="max-w-2xl mx-auto px-4 mb-16">
          <MintBox />
        </section>

        {/* Leaderboard Section */}
        <section className="max-w-4xl mx-auto px-4">
          <Leaderboard />
        </section>
      </main>
    </div>
  );
}
