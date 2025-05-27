import * as Sentry from '@sentry/nextjs';

export function initMonitoring() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });
  }
  // Add analytics initialization here (e.g., Plausible, PostHog, Datadog)
  // Example: window.plausible = ...
}

export function captureException(error: any) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error);
  }
} 