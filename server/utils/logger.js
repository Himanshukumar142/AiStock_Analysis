




const colors = {
  reset: '\x1b[0m',
  info: '\x1b[36m', 
  success: '\x1b[32m', 
  warning: '\x1b[33m', 
  error: '\x1b[31m', 
  agent: '\x1b[35m', 
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
