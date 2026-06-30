type LogLevel = "info" | "warn" | "error" | "debug";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) ?? "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (shouldLog("info")) {
      console.log(`[${formatTimestamp()}] [INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog("warn")) {
      console.warn(`[${formatTimestamp()}] [WARN] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (shouldLog("error")) {
      console.error(`[${formatTimestamp()}] [ERROR] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog("debug")) {
      console.debug(`[${formatTimestamp()}] [DEBUG] ${message}`, ...args);
    }
  },
};
