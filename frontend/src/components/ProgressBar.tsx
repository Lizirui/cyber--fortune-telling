'use client';

import { useEffect, Suspense, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

function ProgressBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstMount = useRef(true);

  useEffect(() => {
    NProgress.configure({ showSpinner: false, minimum: 0.1, speed: 0.5 });

    // 首次挂载不触发，避免页面加载时就显示进度条
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // 路由变化时显示进度条
    NProgress.start();

    // 短暂延迟后自动完成，避免闪烁
    const timer = setTimeout(() => {
      NProgress.done();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  return null;
}

export default function ProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarContent />
      <style jsx global>{`
        #nprogress .bar {
          background: linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4) !important;
          height: 3px !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 9999 !important;
        }
        #nprogress .peg {
          box-shadow: 0 0 10px #8b5cf6, 0 0 5px #8b5cf6 !important;
        }
      `}</style>
    </Suspense>
  );
}
