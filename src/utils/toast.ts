// Global toast utility that can be used anywhere in the app
// This creates a singleton toast manager that can be accessed without React hooks

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

class ToastManager {
  private listeners: Set<(toasts: Toast[]) => void> = new Set();
  public toasts: Toast[] = [];

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener);
    // Immediately notify with current toasts
    listener([...this.toasts]);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(message: string, type: ToastType = 'info', duration?: number) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, message, type, duration };
    this.toasts.push(toast);
    this.notify();

    // Auto-remove after duration
    const removeDuration = duration || 5000;
    setTimeout(() => {
      this.remove(id);
    }, removeDuration);

    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  success(message: string, duration?: number) {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    return this.show(message, 'error', duration || 7000); // Errors stay longer
  }

  warning(message: string, duration?: number) {
    return this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    return this.show(message, 'info', duration);
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

// Export singleton instance
export const toast = new ToastManager();

// Export types
export type { Toast, ToastType };

