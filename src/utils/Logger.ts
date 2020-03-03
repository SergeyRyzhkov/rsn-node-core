import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';
import * as path from 'path';

const logDir = 'log';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const errorFile = path.resolve(logDir, 'serverlog.log');
const exceptionsFile = path.resolve(logDir, 'exceptions.log');

const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export const logger = createLogger({
  exitOnError: false,
  format: combine(
    label({ label: 'right meow!' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.File(
      {
        level: 'info',
        filename: errorFile,
        handleExceptions: true
      }
    )
  ],
  exceptionHandlers: [
    new transports.File({ filename: exceptionsFile })
  ]
});


