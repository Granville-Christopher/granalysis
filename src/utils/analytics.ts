// Analytics tracking utility
import api from './axios';

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private enabled: boolean = true;

  constructor() {
    // Check if analytics is enabled (respect user privacy)
    const analyticsEnabled = localStorage.getItem('analytics_enabled');
    if (analyticsEnabled === 'false') {
      this.enabled = false;
    }
  }

  track(event: AnalyticsEvent) {
    if (!this.enabled) return;

    // Store event locally
    this.events.push({
      ...event,
      timestamp: Date.now(),
    } as any);

    // Send to backend (if implemented)
    this.sendToBackend(event);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
    }
  }

  private async sendToBackend(event: AnalyticsEvent) {
    try {
      // Use axios instance which handles CSRF tokens automatically
      await api.post('/analytics/track', event);
    } catch (error) {
      // Silently fail - analytics should not break the app
      console.warn('[Analytics] Failed to send event:', error);
    }
  }

  // Page view tracking
  pageView(path: string) {
    this.track({
      category: 'Navigation',
      action: 'Page View',
      label: path,
    });
  }

  // Feature usage tracking
  featureUsed(feature: string, details?: string) {
    this.track({
      category: 'Feature Usage',
      action: 'Feature Used',
      label: `${feature}${details ? ` - ${details}` : ''}`,
    });
  }

  // Export tracking
  exportTracked(format: string, fileId?: number) {
    this.track({
      category: 'Export',
      action: 'Export',
      label: format,
      value: fileId,
    });
  }

  // Performance tracking
  performanceTracked(metric: string, value: number) {
    this.track({
      category: 'Performance',
      action: 'Performance Metric',
      label: metric,
      value,
    });
  }

  // Error tracking
  errorTracked(error: string, context?: string) {
    this.track({
      category: 'Error',
      action: 'Error Occurred',
      label: `${error}${context ? ` - ${context}` : ''}`,
    });
  }

  // User engagement tracking
  engagementTracked(action: string, duration?: number) {
    this.track({
      category: 'Engagement',
      action,
      value: duration,
    });
  }

  // Get analytics data
  getEvents() {
    return this.events;
  }

  // Clear analytics data
  clearEvents() {
    this.events = [];
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('analytics_enabled', enabled.toString());
  }

  isEnabled() {
    return this.enabled;
  }
}

export const analytics = new Analytics();

// React hook for analytics
export const useAnalytics = () => {
  return analytics;
};

