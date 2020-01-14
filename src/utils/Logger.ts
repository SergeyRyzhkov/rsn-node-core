import * as winston from 'winston';
import * as fs from 'fs';

const logDir = 'log';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export const logger = winston.createLogger({
  exitOnError: false,

  transports: [
    new winston.transports.File({
      filename: `${logDir}/log.json`,
      level: 'info',
      format: winston.format.json(),
      handleExceptions: true
    }),

    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
  ],
});
