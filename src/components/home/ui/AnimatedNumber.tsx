import React, { useEffect, useState, useRef } from 'react';
import { useIntersectionObserver } from '../hooks';

export const AnimatedNumber = ({ endValue, decimals = 0, duration = 2000, startValue = 0, color }: { endValue: number; decimals?: number; duration?: number; startValue?: number; color?: string }) => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });
  const [count, setCount] = useState(startValue);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isIntersecting || hasAnimated.current) {
      return;
    }

    hasAnimated.current = true;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      const ratio = Math.min(1, progress / duration);
      const currentValue = startValue + (endValue - startValue) * ratio;
      setCount(currentValue);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [endValue, isIntersecting, duration, startValue]);

  return (
    <span 
      ref={ref as React.RefObject<HTMLSpanElement>} 
      style={color ? { color, '--animated-number-color': color } as React.CSSProperties : undefined}
      className={color ? 'animated-number-colored' : undefined}
    >
      {count.toFixed(decimals).toLocaleString()}
    </span>
  );
};


