import React from 'react';

/**
 * Accessibility wrapper component that adds ARIA labels and keyboard navigation
 * to interactive elements that might be missing them.
 */
interface AccessibilityWrapperProps {
  children: React.ReactNode;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({
  children,
  role,
  ariaLabel,
  ariaLabelledBy,
  tabIndex,
  onKeyDown,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter and Space for button-like elements
    if ((e.key === 'Enter' || e.key === ' ') && role === 'button') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).click();
    }
    onKeyDown?.(e);
  };

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      tabIndex={tabIndex}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

/**
 * Hook to add keyboard navigation to clickable elements
 */
export const useKeyboardNavigation = (onClick: () => void) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return {
    role: 'button',
    tabIndex: 0,
    onKeyDown: handleKeyDown,
  };
};

