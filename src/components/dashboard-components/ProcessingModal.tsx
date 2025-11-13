import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ProcessingModalProps {
  isOpen: boolean;
}

const PROCESSING_STEPS = [
  'Reading data',
  'Analyzing data',
  'Generating insights',
  'Creating visualizations',
  'Finalizing results',
];

const ProcessingModal: React.FC<ProcessingModalProps> = ({ isOpen }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [displayedSteps, setDisplayedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setDisplayedSteps([]);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next >= PROCESSING_STEPS.length) {
          // Loop back to beginning
          return 0;
        }
        return next;
      });
    }, 2000); // Change step every 2 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentStepIndex < PROCESSING_STEPS.length) {
      // Add new step to displayed list
      setDisplayedSteps((prev) => {
        const newSteps = [...prev];
        if (newSteps.length === 0 || newSteps[newSteps.length - 1] !== PROCESSING_STEPS[currentStepIndex]) {
          newSteps.push(PROCESSING_STEPS[currentStepIndex]);
          // Keep only last 3 steps visible
          if (newSteps.length > 3) {
            return newSteps.slice(-3);
          }
        }
        return newSteps;
      });
    }
  }, [currentStepIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity" />

      {/* Modal */}
      <div
        className={`relative ${glassmorphismClass} p-12 max-w-md w-full transform transition-all duration-300`}
        style={{
          boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), ${colors.cardShadow}`,
        }}
      >
        {/* Spinner */}
        <div className="flex justify-center mb-8">
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}20 0%, ${colors.accent}10 100%)`,
            }}
          >
            <Loader2
              className="w-12 h-12 animate-spin"
              style={{ color: colors.accent }}
            />
          </div>
        </div>

        {/* Main title */}
        <h2 className={`text-2xl font-bold text-center mb-8 ${colors.text}`}>
          Processing File
        </h2>

        {/* Animated steps container */}
        <div className="relative h-32 overflow-hidden">
          {PROCESSING_STEPS.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isVisible = displayedSteps.includes(step);
            const stepIndex = displayedSteps.indexOf(step);
            const isPrevious = stepIndex >= 0 && stepIndex < displayedSteps.length - 1;

            if (!isVisible && !isActive) return null;

            return (
              <div
                key={index}
                className={`absolute left-0 right-0 transition-all duration-500 ${
                  isActive
                    ? 'opacity-100 translate-y-0'
                    : isPrevious
                    ? 'opacity-0 -translate-y-full'
                    : 'opacity-0 translate-y-full'
                }`}
                style={{
                  top: isActive ? '50%' : isPrevious ? '0%' : '100%',
                  transform: isActive
                    ? 'translateY(-50%)'
                    : isPrevious
                    ? 'translateY(-100%)'
                    : 'translateY(0%)',
                }}
              >
                <p
                  className={`text-center text-lg font-medium transition-colors ${
                    isActive ? colors.text : colors.textSecondary
                  }`}
                >
                  {step}...
                </p>
              </div>
            );
          })}
        </div>

        {/* Subtitle */}
        <p className={`text-center text-sm mt-8 ${colors.textSecondary}`}>
          This may take up to a minute
        </p>
      </div>
    </div>
  );
};

export default ProcessingModal;

