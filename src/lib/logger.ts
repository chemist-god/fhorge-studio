type LogContext = {
  requestId?: string;
  traceId?: string;
  userId?: string;
  gymId?: string;
  action?: string;
  durationMs?: number;
  errorCode?: string;
};

function write(level: "info" | "warn" | "error", message: string, context: LogContext = {}) {
  console[level](JSON.stringify({ level, message, ...context, timestamp: new Date().toISOString() }));
}

export const logger = {
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context),
};
