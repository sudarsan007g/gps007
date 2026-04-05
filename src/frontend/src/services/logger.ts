/**
 * Centralized logging service using Sentry
 * Provides error tracking, performance monitoring, and breadcrumb logging
 */

// For development, Sentry is optional (graceful fallback)
let sentryInitialized = false;

interface LogContext {
  [key: string]: any;
}

export const logger = {
  /**
   * Initialize Sentry (called from main.tsx)
   */
  init: (sentryDsn?: string) => {
    if (!sentryDsn) {
      console.warn("⚠️ Sentry DSN not configured. Error tracking disabled");
      return;
    }

    try {
      // Dynamic import to avoid errors if @sentry/react not installed
      import("@sentry/react").then((Sentry) => {
        Sentry.init({
          dsn: sentryDsn,
          environment: import.meta.env.MODE || "development",
          tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1,
          release: "1.0.0",
          integrations: [
            new Sentry.Replay({
              maskAllText: true,
              blockAllMedia: true,
            }),
          ],
          replaysSessionSampleRate: 0.1,
          replayOnErrorSampleRate: 1.0,
        });
        sentryInitialized = true;
        console.log("✅ Sentry initialized");
      });
    } catch (err) {
      console.error("Failed to initialize Sentry:", err);
    }
  },

  /**
   * Log error with context
   */
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    console.error(`❌ ${message}`, error, context);

    try {
      import("@sentry/react").then((Sentry) => {
        const exception = error instanceof Error ? error : new Error(message);
        Sentry.captureException(exception, {
          contexts: { custom: context ?? {} },
        });
      });
    } catch {
      // Sentry not available
    }
  },

  /**
   * Log warning
   */
  warn: (message: string, context?: LogContext) => {
    console.warn(`⚠️ ${message}`, context);

    try {
      import("@sentry/react").then((Sentry) => {
        Sentry.captureMessage(message, "warning");
      });
    } catch {
      // Sentry not available
    }
  },

  /**
   * Log info
   */
  info: (message: string, context?: LogContext) => {
    console.log(`ℹ️ ${message}`, context);

    try {
      import("@sentry/react").then((Sentry) => {
        Sentry.addBreadcrumb({
          message,
          level: "info",
          data: context,
        });
      });
    } catch {
      // Sentry not available
    }
  },

  /**
   * Log performance metric
   */
  performance: (metricName: string, value: number, unit = "ms") => {
    console.log(`⏱️ ${metricName}: ${value}${unit}`);

    try {
      import("@sentry/react").then((Sentry) => {
        Sentry.addBreadcrumb({
          message: `Performance: ${metricName}`,
          level: "info",
          data: { [metricName]: value, unit },
        });
      });
    } catch {
      // Sentry not available
    }
  },
};
