export default function Loading() {
  return (
    <div className="min-h-screen bg-cyber-bg cyber-grid-bg relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-48 md:w-80 h-48 md:h-80 bg-cyber-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 md:w-80 h-48 md:h-80 bg-cyber-primary/5 rounded-full blur-3xl" />
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
        {/* 页面标题占位 */}
        <div className="mb-6 md:mb-10">
          <div className="h-10 w-32 bg-gray-800 rounded mb-2 md:mb-3 animate-pulse" />
          <div className="h-5 w-48 bg-gray-800 rounded animate-pulse" />
        </div>

        {/* Search and Controls 占位 */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2 max-w-md mx-auto">
            <div className="flex-1 h-10 bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-10 w-16 bg-gray-800 rounded-lg animate-pulse" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-8 bg-gray-800 rounded animate-pulse" />
              <div className="h-8 w-28 bg-gray-800 rounded-lg animate-pulse" />
            </div>

            <div className="h-8 w-16 bg-gray-800 rounded-lg animate-pulse" />
          </div>

          <div className="h-4 w-32 bg-gray-800 rounded mx-auto animate-pulse" />
        </div>

        {/* Filter 占位 */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-9 w-14 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>

        {/* NFT 卡片网格占位 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-cyber-card rounded-2xl overflow-hidden border border-cyber-border"
            >
              <div className="aspect-square bg-gray-800 animate-pulse" />
              <div className="p-4">
                <div className="h-6 w-3/4 bg-gray-800 rounded mb-2 animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-800 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-800 rounded-lg mt-3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
