import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import path from 'path';

const logDir = 'log';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.resolve(logDir, 'serverlog.log');
const exceptionsFile = path.resolve(logDir, 'exceptions.log');

const { combine, timestamp, label, printf } = format;

const printFormatFn = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export const logger = createLogger({
  exitOnError: false,
  format: combine(
    label({ label: 'right meow!' }),
    timestamp(),
    printFormatFn
  ),
  transports: [
    new transports.File(
      {
        level: 'info',
        filename: logFile,
        handleExceptions: true
      }
    )
  ],
  exceptionHandlers: [
    new transports.File(
      {
        filename: exceptionsFile,
        handleExceptions: true
      }
    )
  ]
});


