export default function Loading() {
  return (
    <div className="min-h-screen bg-cyber-bg cyber-grid-bg relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-80 h-48 md:h-80 bg-cyber-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 md:w-80 h-48 md:h-80 bg-cyber-secondary/5 rounded-full blur-3xl" />
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

      <main className="pt-16 md:pt-20 pb-8 md:pb-12 max-w-7xl mx-auto px-3 md:px-4 relative z-10">
        {/* 用户信息卡片占位 */}
        <div className="glass-cyber rounded-xl p-6 md:p-8 mb-6 md:mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-cyber-primary/5 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div>
              <div className="h-9 w-32 bg-gray-800 rounded mb-2 md:mb-3 animate-pulse" />
              <div className="h-4 w-48 md:w-64 bg-gray-800 rounded animate-pulse" />
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="h-8 w-12 bg-gray-700 rounded mx-auto animate-pulse" />
                <div className="h-3 w-12 bg-gray-700 rounded mx-auto mt-1 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* NFT Grid 占位 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-cyber-card rounded-xl overflow-hidden border border-cyber-border"
            >
              <div className="aspect-square bg-gray-800 animate-pulse" />
              <div className="p-3">
                <div className="h-5 w-3/4 bg-gray-800 rounded mb-1 animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
