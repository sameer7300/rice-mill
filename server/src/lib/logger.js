const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB rotate threshold

function getLogPath(level) {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOG_DIR, `${level}-${date}.log`);
}

function write(level, message, meta = {}) {
  const entry = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  }) + '\n';

  // Always print to console
  if (level === 'error') {
    console.error(`[${level.toUpperCase()}] ${message}`, meta);
  } else if (process.env.NODE_ENV !== 'production' || level === 'warn') {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }

  // Write to file (non-blocking, silent fail)
  const filePath = getLogPath(level);
  fs.appendFile(filePath, entry, (err) => {
    if (err && err.code !== 'ENOENT') {
      // Silently ignore write errors — never let logging crash the server
    }
  });
}

const logger = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => {
    // Normalize Error objects
    if (meta instanceof Error) {
      meta = { error: meta.message, stack: meta.stack };
    } else if (meta && meta.error instanceof Error) {
      meta = { ...meta, error: meta.error.message, stack: meta.error.stack };
    }
    write('error', message, meta);
  },
};

module.exports = logger;
