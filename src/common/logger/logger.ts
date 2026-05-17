import * as winston from 'winston';
import * as path from 'path';

const logDir = process.env.LOG_DIR || './logs';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, context }) => {
    return `${timestamp} [${level.toUpperCase()}] [${context}] ${message}`;
  }),
);

export class Logger {
  private logger: winston.Logger;

  constructor(context: string) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'debug',
      format: logFormat,
      transports: [
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          maxsize: 10485760,
          maxFiles: 10,
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
          maxsize: 10485760,
          maxFiles: 10,
        }),
      ],
      defaultMeta: { context },
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message }) => {
              return `${timestamp} [${level}] ${message}`;
            }),
          ),
        }),
      );
    }
  }

  info(message: string, meta?: unknown): void {
    this.logger.info(message, { context: this.logger.defaultMeta?.context });
  }

  error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      this.logger.error(`${message} - ${error.message}`, {
        stack: error.stack,
      });
    } else {
      this.logger.error(message, { error });
    }
  }

  warn(message: string, meta?: unknown): void {
    this.logger.warn(message, { meta });
  }

  debug(message: string, meta?: unknown): void {
    this.logger.debug(message, { meta });
  }
}
