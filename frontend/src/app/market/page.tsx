import { Header } from '@/components/Header';
import { MarketGrid } from '@/components/MarketGrid';

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-cyber-bg">
      <Header />
      <main className="pt-20 pb-12 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-cyber-primary mb-8">市场</h1>
        <MarketGrid />
      </main>
    </div>
  );
}
