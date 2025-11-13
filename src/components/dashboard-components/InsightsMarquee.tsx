import React, { useState, useEffect } from "react";
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

  // Prepare content arrays
  const allContent = [
    { type: "alerts" as const, items: alerts?.filter(Boolean) || [] },
    { type: "recommendations" as const, items: aiRecommendations?.filter(Boolean) || [] },
    { type: "insights" as const, items: text ? [text] : [] },
  ].filter((content) => content.items.length > 0);
  
  // Debug: Log when content is available
  React.useEffect(() => {
    console.log("🎬 Marquee Debug:", {
      alerts: alerts?.length || 0,
      aiRecommendations: aiRecommendations?.length || 0,
      text: text ? 1 : 0,
      allContentLength: allContent.length,
      allContent: allContent.map(c => ({ type: c.type, count: c.items.length }))
    });
  }, [alerts, aiRecommendations, text, allContent.length]);

  useEffect(() => {
    if (allContent.length === 0) {
      setCurrentContent({ type: null, items: [] });
      setIsVisible(false);
      return;
    }

    let currentIndex = 0;
    let timeoutIds: NodeJS.Timeout[] = [];

    const clearAllTimeouts = () => {
      timeoutIds.forEach(id => clearTimeout(id));
      timeoutIds = [];
    };

    const showNextContent = () => {
      if (allContent.length === 0) return;

      const content = allContent[currentIndex];
      
      // Slide in from bottom
      setIsVisible(false);
      setIsAnimating(true);
      
      const timeout1 = setTimeout(() => {
        setCurrentContent(content);
        setIsVisible(true);
        setIsAnimating(false);
      }, 300);
      timeoutIds.push(timeout1);

      // Wait for content to scroll completely before showing next
      // Estimate: each item takes ~4s to scroll, plus buffer
      const totalScrollTime = Math.max(content.items.length * 4000, 15000); // Min 15s
      const slideOutDelay = totalScrollTime + 2000; // 2s buffer
      
      const timeout2 = setTimeout(() => {
        // Slide out
        setIsVisible(false);
        setIsAnimating(true);
        
        const timeout3 = setTimeout(() => {
          // Move to next content
          currentIndex = (currentIndex + 1) % allContent.length;
          showNextContent();
        }, 500);
        timeoutIds.push(timeout3);
      }, slideOutDelay);
      timeoutIds.push(timeout2);
    };

    // Initialize with first content immediately
    if (allContent.length > 0) {
      // Set initial content immediately
      setCurrentContent(allContent[0]);
      setIsVisible(true);
      setIsAnimating(false);
      currentIndex = 0;
      
      // Start cycling after initial display period
      if (allContent.length > 1) {
        const startTimeout = setTimeout(() => {
          currentIndex = 1;
          showNextContent();
        }, Math.max(allContent[0].items.length * 4000, 15000) + 2000);
        timeoutIds.push(startTimeout);
      } else {
        // If only one content type, restart it after it finishes scrolling
        const restartTimeout = setTimeout(() => {
          setIsVisible(false);
          setIsAnimating(true);
          const restartTimeout2 = setTimeout(() => {
            setCurrentContent(allContent[0]);
            setIsVisible(true);
            setIsAnimating(false);
          }, 500);
          timeoutIds.push(restartTimeout2);
        }, Math.max(allContent[0].items.length * 4000, 15000) + 2000);
        timeoutIds.push(restartTimeout);
      }
    }

    // Cleanup on unmount
    return () => {
      clearAllTimeouts();
    };
  }, [alerts.length, aiRecommendations.length, text]);

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
      className={`w-full border-t mt-6 ${
        colors.isDark ? "border-white/10" : "border-black/10"
      }`}
      style={{
        background: isDark
          ? `linear-gradient(135deg, rgba(79, 163, 255, 0.25) 0%, rgba(29, 78, 216, 0.35) 100%)`
          : `linear-gradient(135deg, rgba(79, 163, 255, 0.3) 0%, rgba(29, 78, 216, 0.4) 100%)`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: `0 -4px 20px ${colors.isDark ? "rgba(79, 163, 255, 0.2)" : "rgba(29, 78, 216, 0.15)"}`,
        height: "80px",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem",
        borderBottomLeftRadius: "0",
        borderBottomRightRadius: "0",
        borderLeft: `1px solid ${isDark ? "rgba(79, 163, 255, 0.3)" : "rgba(29, 78, 216, 0.3)"}`,
        borderRight: `1px solid ${isDark ? "rgba(79, 163, 255, 0.3)" : "rgba(29, 78, 216, 0.3)"}`,
        borderTop: `1px solid ${isDark ? "rgba(79, 163, 255, 0.4)" : "rgba(29, 78, 216, 0.4)"}`,
      }}
    >
      <div
        className={`overflow-hidden h-full ${
          isVisible && allContent.length > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
        } transition-all duration-500 ease-in-out`}
      >
        <div className="flex items-center h-full px-6">
          <div className="flex items-center space-x-4 min-w-[200px]">
            <span className="text-2xl">{getIcon()}</span>
            <div>
              <p className={`text-xs font-semibold uppercase ${colors.textSecondary}`}>
                {getTitle()}
              </p>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden ml-6 relative h-full">
            {currentContent.items.length > 0 ? (
              <div className="absolute inset-0 flex items-center">
                <div
                  className={`flex space-x-8 whitespace-nowrap ${
                    isVisible && !isAnimating ? "animate-scroll" : ""
                  }`}
                  style={{
                    animation: isVisible && !isAnimating && currentContent.items.length > 0
                      ? `scroll ${Math.max(currentContent.items.length * 4, 20)}s linear infinite`
                      : "none",
                  }}
                >
                  {currentContent.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0"
                      style={{ minWidth: "max-content", paddingRight: "2rem" }}
                    >
                      <p className={`text-sm ${colors.text}`}>{item}</p>
                    </div>
                  ))}
                  {/* Duplicate for seamless loop */}
                  {currentContent.items.map((item, index) => (
                    <div
                      key={`dup-${index}`}
                      className="flex-shrink-0"
                      style={{ minWidth: "max-content", paddingRight: "2rem" }}
                    >
                      <p className={`text-sm ${colors.text}`}>{item}</p>
                    </div>
                  ))}
                </div>
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
        }
      `}</style>
    </div>
  );
};

export default InsightsMarquee;

