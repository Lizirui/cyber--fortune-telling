'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

function ProgressBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleRouteChange = () => {
      NProgress.done();
    };

    NProgress.start();

    return () => {
      handleRouteChange();
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
