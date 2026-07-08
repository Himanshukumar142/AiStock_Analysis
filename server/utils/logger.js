/**
 * Simple Logger Utility
 * Provides color-coded log outputs for Node.js console to track agent execution stages.
 */

const colors = {
  reset: '\x1b[0m',
  info: '\x1b[36m', // Cyan
  success: '\x1b[32m', // Green
  warning: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  agent: '\x1b[35m', // Magenta
};

const getTimestamp = () => {
  return new Date().toISOString();
};

export const logger = {
  info: (message, meta = '') => {
    console.log(`${colors.info}[INFO] [${getTimestamp()}] ${message}${colors.reset}`, meta);
  },

  success: (message, meta = '') => {
    console.log(`${colors.success}[SUCCESS] [${getTimestamp()}] ${message}${colors.reset}`, meta);
  },

  warn: (message, meta = '') => {
    console.warn(`${colors.warning}[WARN] [${getTimestamp()}] ${message}${colors.reset}`, meta);
  },

  error: (message, error = '') => {
    console.error(
      `${colors.error}[ERROR] [${getTimestamp()}] ${message}${colors.reset}`,
      error instanceof Error ? error.stack || error.message : error
    );
  },

  agent: (message, meta = '') => {
    console.log(`${colors.agent}[AGENT] [${getTimestamp()}] 🤖 ${message}${colors.reset}`, meta);
  }
};
