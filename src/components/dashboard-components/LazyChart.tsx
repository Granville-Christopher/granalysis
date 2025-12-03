import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';

interface LazyChartProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}

/**
 * Lazy loads charts when they come into viewport
 * Uses IntersectionObserver for efficient lazy loading
 */
export const LazyChart: React.FC<LazyChartProps> = ({ 
  children, 
  fallback = <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div>,
  threshold = 0.1 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setShouldLoad(true);
            // Once loaded, we can disconnect the observer
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        });
      },
      { threshold, rootMargin: '50px' } // Start loading 50px before entering viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [threshold]);

  return (
    <div ref={containerRef} style={{ minHeight: '300px' }}>
      {shouldLoad ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

