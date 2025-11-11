import React from 'react';
import { useIntersectionObserver } from '../hooks';

export const ScrollReveal = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${className} transition-all duration-1000 transform ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {children}
    </div>
  );
};


