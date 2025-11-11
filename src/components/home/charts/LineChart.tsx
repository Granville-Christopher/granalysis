import React from 'react';
import { ThemeConfig } from '../theme';
import { monthlySalesData } from '../data';
import { useIntersectionObserver } from '../hooks';

export const LineChart = ({ colors }: { colors: ThemeConfig }) => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });
  const maxVal = 100;
  const labels = monthlySalesData.map(d => d.month);
  const chartHeight = 250;

  const PRODUCT_COLORS = {
    'Product A': colors.accent,
    'Product B': '#F97316',
    'Product C': '#10B981',
  };

  const generatePath = (productKey: keyof typeof monthlySalesData[0]) => {
    let points = '';
    const numPoints = monthlySalesData.length;

    monthlySalesData.forEach((d, i) => {
      const x = (i / (numPoints - 1)) * 100;
      const y = (maxVal - (d[productKey] as number)) * (chartHeight / maxVal);
      points += `${x} ${y}, `;
    });

    return points.slice(0, -2);
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="flex h-full relative p-2 md:p-4">
      <div className={`absolute left-0 top-0 h-full w-8 text-xs ${colors.textSecondary} flex flex-col justify-between pt-2 pb-6`}>
        <span>100%</span>
        <span>50%</span>
        <span>0%</span>
      </div>

      <div className="flex-grow ml-8 relative">
        <svg viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none" className="w-full h-full">
          <line x1="0" y1={0} x2="100" y2={0} stroke={colors.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} />
          <line x1="0" y1={chartHeight / 2} x2="100" y2={chartHeight / 2} stroke={colors.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} />
          <line x1="0" y1={chartHeight} x2="100" y2={chartHeight} stroke={colors.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} />

          {Object.keys(PRODUCT_COLORS).map((key, index) => {
            const productKey = key as keyof typeof monthlySalesData[0];
            const color = (PRODUCT_COLORS as any)[key];
            const pathData = generatePath(productKey);

            return (
              <polyline
                key={key}
                points={pathData}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'stroke-dashoffset 2s ease-out', strokeDasharray: '200', strokeDashoffset: isIntersecting ? 0 : 200, transitionDelay: `${index * 0.1}s` }}
              />
            );
          })}
        </svg>

        <div className={`w-full flex justify-between mt-2 text-xs ${colors.textSecondary}`}>
          {labels.map(label => (
            <span key={label} className="w-1/6 text-center">{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};


