import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Upload, FileText, BarChart3, MessageCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig } from '../home/theme';

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string; // CSS selector for element to highlight
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete, onSkip }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Granalysis!',
      description: 'Let\'s take a quick tour of your dashboard. You can skip this anytime.',
      icon: <CheckCircle className="w-8 h-8" style={{ color: colors.accent }} />,
    },
    {
      id: 'upload',
      title: 'Upload Your Data',
      description: 'Click the upload button in the sidebar to add your CSV or Excel files. We support files up to 10MB.',
      icon: <Upload className="w-8 h-8" style={{ color: colors.accent }} />,
      target: '[data-tutorial="upload-button"]',
    },
    {
      id: 'files',
      title: 'Manage Your Files',
      description: 'All your uploaded files appear here. Click on any file to view its insights and analytics.',
      icon: <FileText className="w-8 h-8" style={{ color: colors.accent }} />,
      target: '[data-tutorial="files-list"]',
    },
    {
      id: 'insights',
      title: 'View Insights',
      description: 'Get instant insights, forecasts, and AI recommendations for your data. Scroll down to see more.',
      icon: <BarChart3 className="w-8 h-8" style={{ color: colors.accent }} />,
      target: '[data-tutorial="insights-panel"]',
    },
    {
      id: 'ai-assistant',
      title: 'AI Chat Assistant',
      description: 'Ask questions about your data, get charts, and receive business advice. Available for Business and Enterprise tiers.',
      icon: <MessageCircle className="w-8 h-8" style={{ color: colors.accent }} />,
      target: '[data-tutorial="ai-assistant"]',
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start uploading your data and discover powerful insights. Need help? Visit the Help Center anytime.',
      icon: <CheckCircle className="w-8 h-8" style={{ color: colors.accent }} />,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding_completed', 'true');
    onSkip();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div
        className="max-w-md w-full rounded-2xl shadow-2xl"
        style={{
          backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <div>
            <h3 className={`text-lg font-semibold ${colors.text}`}>
              Step {currentStep + 1} of {steps.length}
            </h3>
            <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: colors.accent,
                }}
              />
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Skip tutorial"
          >
            <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-6 flex justify-center">
            {step.icon}
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${colors.text}`}>{step.title}</h2>
          <p className={`text-lg ${colors.textSecondary} mb-6`}>{step.description}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: colors.text,
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-lg font-semibold text-white flex items-center gap-2"
            style={{ backgroundColor: colors.accent }}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;

