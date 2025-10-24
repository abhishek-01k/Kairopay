/**
 * Structured logging utilities
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

/**
 * Structured logger with context
 */
export function log(
  level: LogLevel,
  message: string,
  context?: LogContext
): void {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...context,
  };

  const logMethod = console[level] || console.log;
  logMethod(JSON.stringify(logData));
}

/**
 * Log info message
 */
export function logInfo(message: string, context?: LogContext): void {
  log("info", message, context);
}

/**
 * Log warning message
 */
export function logWarn(message: string, context?: LogContext): void {
  log("warn", message, context);
}

/**
 * Log error message
 */
export function logError(message: string, context?: LogContext): void {
  log("error", message, context);
}

/**
 * Log debug message (only in development)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === "development") {
    log("debug", message, context);
  }
}

/**
 * Log API request
 */
export function logRequest(
  method: string,
  path: string,
  context?: LogContext
): void {
  logInfo(`${method} ${path}`, context);
}

/**
 * Log API error with full context
 */
export function logApiError(
  method: string,
  path: string,
  error: unknown,
  context?: LogContext
): void {
  logError(`${method} ${path} - Error`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
}

