import React, { useState, useEffect, useMemo, useRef } from "react";
import { THEME_CONFIG, ThemeConfig } from "../home/theme";
import { useTheme } from "../../contexts/ThemeContext";

interface InsightsMarqueeProps {
  alerts?: string[];
  aiRecommendations?: string[];
  text?: string;
}

const InsightsMarquee: React.FC<InsightsMarqueeProps> = ({
  alerts = [],
  aiRecommendations = [],
  text = "",
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  const [currentContent, setCurrentContent] = useState<{
    type: "alerts" | "recommendations" | "insights" | null;
    items: string[];
  }>({ type: null, items: [] });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const currentIndexRef = useRef(0);
  const initializedRef = useRef(false);

  // Prepare content arrays
  const allContent = useMemo(() => {
    return [
      { type: "alerts" as const, items: (alerts || []).filter((i) => !!i && i.toString().trim().length > 0) },
      { type: "recommendations" as const, items: (aiRecommendations || []).filter((i) => !!i && i.toString().trim().length > 0) },
      { type: "insights" as const, items: text && text.toString().trim().length > 0 ? [text] : [] },
    ].filter((content) => content.items.length > 0);
  }, [alerts, aiRecommendations, text]);
  
  // Debug: Log when content is available
  React.useEffect(() => {
    console.log("🎬 Marquee Debug:", {
      alerts: alerts?.length || 0,
      aiRecommendations: aiRecommendations?.length || 0,
      text: text ? 1 : 0,
      allContentLength: allContent.length,
      allContent: allContent.map(c => ({ type: c.type, count: c.items.length }))
    });
  }, [alerts, aiRecommendations, text, allContent]);

  useEffect(() => {
    if (allContent.length === 0) {
      setCurrentContent({ type: null, items: [] });
      setIsVisible(false);
      initializedRef.current = false;
      currentIndexRef.current = 0;
      return;
    }

    let currentIndex = currentIndexRef.current || 0;

    const clearAllTimeouts = () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current = [];
    };

    const showNextContent = () => {
      if (allContent.length === 0) return;
      if (isPaused) return; // don't advance while paused

      const content = allContent[currentIndex];
      
      // Slide in from bottom
      setIsVisible(false);
      setIsAnimating(true);
      
      const timeout1 = setTimeout(() => {
        setCurrentContent(content);
        setIsVisible(true);
        setIsAnimating(false);
      }, 300);
      timeoutsRef.current.push(timeout1);

      // Wait for content to scroll completely before showing next
      // Slower rotation for readability. Recommendations: 10s/item, 12 minutes per section.
      const perItemMs = content.type === "recommendations" ? 10000 : 4000;
      const minSectionMs = content.type === "recommendations" ? 12 * 60 * 1000 : 12000;
      const totalScrollTime = Math.max(content.items.length * perItemMs, minSectionMs);
      const slideOutDelay = totalScrollTime + 1200; // modest buffer
      
      const timeout2 = setTimeout(() => {
        if (isPaused) return; // don't slide out while paused
        // Slide out
        setIsVisible(false);
        setIsAnimating(true);
        
        const timeout3 = setTimeout(() => {
          // Move to next content
          currentIndex = (currentIndex + 1) % allContent.length;
          currentIndexRef.current = currentIndex;
          showNextContent();
        }, 500);
        timeoutsRef.current.push(timeout3);
      }, slideOutDelay);
      timeoutsRef.current.push(timeout2);
    };

    // Initialize with first content immediately
    if (allContent.length > 0 && !initializedRef.current) {
      // Set initial content immediately
      setCurrentContent(allContent[currentIndex]);
      setIsVisible(true);
      setIsAnimating(false);
      currentIndexRef.current = currentIndex;
      initializedRef.current = true;
      
      // Start cycling after initial display period
      if (allContent.length > 1) {
        const firstType = allContent[currentIndex].type;
        const firstPerItemMs = firstType === "recommendations" ? 10000 : 4000;
        const firstMinMs = firstType === "recommendations" ? 12 * 60 * 1000 : 12000;
        const firstTotal = Math.max(allContent[currentIndex].items.length * firstPerItemMs, firstMinMs) + 1200;
        const startTimeout = setTimeout(() => {
          currentIndex = (currentIndex + 1) % allContent.length;
          currentIndexRef.current = currentIndex;
          showNextContent();
        }, firstTotal);
        timeoutsRef.current.push(startTimeout);
      } else {
        // If only one content type, restart it after it finishes scrolling
        const onlyPerItemMs = allContent[currentIndex].type === "recommendations" ? 10000 : 4000;
        const onlyMinMs = allContent[currentIndex].type === "recommendations" ? 12 * 60 * 1000 : 12000;
        const onlyTotal = Math.max(allContent[currentIndex].items.length * onlyPerItemMs, onlyMinMs) + 1200;
        const restartTimeout = setTimeout(() => {
          setIsVisible(false);
          setIsAnimating(true);
          const restartTimeout2 = setTimeout(() => {
            setCurrentContent(allContent[currentIndex]);
            setIsVisible(true);
            setIsAnimating(false);
          }, 500);
          timeoutsRef.current.push(restartTimeout2);
        }, onlyTotal);
        timeoutsRef.current.push(restartTimeout);
      }
    }

    // Cleanup on unmount
    return () => {
      clearAllTimeouts();
    };
  }, [allContent, isPaused]);

  const getIcon = () => {
    switch (currentContent.type) {
      case "alerts":
        return "⚠️";
      case "recommendations":
        return "💡";
      case "insights":
        return "📊";
      default:
        return "ℹ️";
    }
  };

  const getTitle = () => {
    switch (currentContent.type) {
      case "alerts":
        return "Alerts";
      case "recommendations":
        return "AI Recommendations";
      case "insights":
        return "General Insights";
      default:
        return "";
    }
  };

  // Always render the container, but hide content if empty
  if (allContent.length === 0) {
    return null;
  }

  return (
    <div
      className={`w-full border-t mt-0 ${
        colors.isDark ? "border-white/10" : "border-black/10"
      } marquee-wrap`}
      style={{
        background: isDark
          ? `linear-gradient(135deg, rgba(79, 163, 255, 0.25) 0%, rgba(29, 78, 216, 0.35) 100%)`
          : `linear-gradient(135deg, rgba(79, 163, 255, 0.3) 0%, rgba(29, 78, 216, 0.4) 100%)`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: `0 -4px 20px ${colors.isDark ? "rgba(79, 163, 255, 0.2)" : "rgba(29, 78, 216, 0.15)"}`,
        height: "50px",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem",
        borderBottomLeftRadius: "0",
        borderBottomRightRadius: "0",
        borderLeft: `1px solid ${isDark ? "rgba(79, 163, 255, 0.3)" : "rgba(29, 78, 216, 0.3)"}`,
        borderRight: `1px solid ${isDark ? "rgba(79, 163, 255, 0.3)" : "rgba(29, 78, 216, 0.3)"}`,
        borderTop: `1px solid ${isDark ? "rgba(79, 163, 255, 0.4)" : "rgba(29, 78, 216, 0.4)"}`,
      }}
      onMouseEnter={() => {
        setIsPaused(true);
        // stop timers so content doesn't rotate while paused
        timeoutsRef.current.forEach(id => clearTimeout(id));
        timeoutsRef.current = [];
      }}
      onMouseLeave={() => {
        setIsPaused(false);
        // resume cycle if nothing scheduled
        if (timeoutsRef.current.length === 0 && initializedRef.current) {
          // kick the cycle
          const kick = setTimeout(() => {
            // no-op: next cycle will happen from existing state when timers schedule
          }, 0);
          timeoutsRef.current.push(kick);
        }
      }}
    >
      <div
        className={`overflow-hidden h-full ${
          isVisible && allContent.length > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
        } transition-all duration-500 ease-in-out`}
      >
        <div className="flex items-center h-full px-4">
          <div className="flex items-center space-x-3 min-w-[180px]">
            <span className="text-lg">{getIcon()}</span>
            <div>
              <p className={`text-xs font-semibold uppercase ${colors.textSecondary}`}>
                {getTitle()}
              </p>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden ml-4 relative h-full">
            {currentContent.items.length > 0 ? (
              <div className="absolute inset-0 flex items-center">
                {/* Markdown-lite formatter for bold asterisks */}
                {(() => {
                  const escapeHtml = (s: string) =>
                    s
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#039;");
                  const toBoldHtml = (s: string) => {
                    // Convert **bold** and *bold* to <strong>bold</strong>
                    let t = escapeHtml(s);
                    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                    t = t.replace(/\*(.+?)\*/g, "<strong>$1</strong>");
                    return t;
                  };
                  const formatted = currentContent.items.map((item) => toBoldHtml(item));
                  const perItemSec = currentContent.type === "recommendations" ? 10 : 4;
                  const minSec = currentContent.type === "recommendations" ? 12 * 60 : 12;
                  const animSeconds = Math.max(formatted.length * perItemSec, minSec);
                  return (
                    <div
                      className={`flex space-x-8 whitespace-nowrap ${
                        isVisible && !isAnimating ? "animate-scroll" : ""
                      }`}
                      style={{
                        animation:
                          isVisible && !isAnimating && currentContent.items.length > 0
                            ? `scroll ${animSeconds}s linear infinite`
                            : "none",
                      }}
                    >
                      {formatted.map((item, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0"
                          style={{ minWidth: "max-content", paddingRight: "2rem" }}
                        >
                          <p
                            className={`text-sm ${colors.text}`}
                            dangerouslySetInnerHTML={{ __html: item }}
                          />
                        </div>
                      ))}
                      {/* Duplicate for seamless loop */}
                      {formatted.map((item, index) => (
                        <div
                          key={`dup-${index}`}
                          className="flex-shrink-0"
                          style={{ minWidth: "max-content", paddingRight: "2rem" }}
                        >
                          <p
                            className={`text-sm ${colors.text}`}
                            dangerouslySetInnerHTML={{ __html: item }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex items-center h-full">
                <p className={`text-sm ${colors.textSecondary}`}>No content available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll linear infinite;
          animation-play-state: running;
        }
        .marquee-wrap:hover .animate-scroll {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
};

export default InsightsMarquee;

