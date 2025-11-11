import React from "react";

interface InsightsCarouselProps {
  slideIdx: number;
  setSlideIdx: (idx: number) => void;
  slides: { key: string; content: React.ReactNode }[];
}

const InsightsCarousel: React.FC<InsightsCarouselProps> = ({
  slideIdx,
  setSlideIdx,
  slides,
}) => (
  <div className="relative w-full overflow-hidden transition-all duration-700">
    {slides[slideIdx].content}
    <div className="flex justify-center mt-2 gap-2">
      {slides.map((s, i) => (
        <button
          key={s.key}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i === slideIdx
              ? "bg-blue-500 dark:bg-blue-400"
              : "bg-gray-300 dark:bg-gray-600"
          }`}
          onClick={() => setSlideIdx(i)}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  </div>
);

export default InsightsCarousel;
