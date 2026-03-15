export default function Loading() {
  return (
    <div className="min-h-screen bg-cyber-bg cyber-grid-bg cyber-radial-glow relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-cyber-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-cyber-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Header 占位 */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="h-8 w-24 bg-gray-800 rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-20 bg-gray-800 rounded animate-pulse" />
            <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <main className="pt-16 md:pt-20 pb-8 md:pb-12 relative z-10">
        {/* Hero Section 占位 */}
        <section className="text-center py-12 md:py-20 relative px-4">
          <div className="inline-block relative">
            <div className="h-12 md:h-16 w-48 md:w-72 bg-gray-800 rounded mx-auto mb-3 md:mb-4 animate-pulse" />
          </div>
          <div className="h-6 md:h-8 w-64 md:w-96 bg-gray-800 rounded mx-auto mb-4 animate-pulse" />
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
          </div>
        </section>

        {/* Mint Section 占位 */}
        <section className="max-w-2xl mx-auto px-3 md:px-4 mb-12 md:mb-20">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-800">
            <div className="h-10 w-32 bg-gray-800 rounded mx-auto mb-6 animate-pulse" />
            <div className="aspect-square bg-gray-800 rounded-xl animate-pulse" />
            <div className="h-14 w-full bg-gray-800 rounded-xl mt-6 animate-pulse" />
          </div>
        </section>
      </main>
    </div>
  );
}
