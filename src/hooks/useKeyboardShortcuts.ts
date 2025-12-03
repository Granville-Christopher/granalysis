import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.action();
        }
      });
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

// Common keyboard shortcuts for the app
export const COMMON_SHORTCUTS: Record<string, Omit<KeyboardShortcut, 'action'>> = {
  UPLOAD: { key: 'u', ctrl: true, description: 'Upload file' },
  SEARCH: { key: 'k', ctrl: true, description: 'Search' },
  NEW_CHAT: { key: 'n', ctrl: true, description: 'New chat' },
  CLOSE_MODAL: { key: 'Escape', description: 'Close modal' },
  SAVE: { key: 's', ctrl: true, description: 'Save' },
  EXPORT: { key: 'e', ctrl: true, shift: true, description: 'Export data' },
  REFRESH: { key: 'r', ctrl: true, description: 'Refresh' },
  HELP: { key: '?', shift: true, description: 'Show help' },
  DARK_MODE: { key: 'd', ctrl: true, shift: true, description: 'Toggle dark mode' },
};

