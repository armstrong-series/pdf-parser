import { Injectable, Logger } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService extends Logger {
  private logger: winston.Logger;

  constructor() {
    super();
    try {
      this.logger = winston.createLogger({
        level: 'debug',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.json(),
        ),
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple(),
            ),
          }),
          new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
          }) as winston.transport,
        ],
      });
      this.logger.info('Logger initialized');
    } catch (error) {
      console.error('Failed to initialize logger:', error);
    }
  }

  log(message: string): void {
    this.logger.info(message);
    super.log(message);
  }

  error(message: string, trace?: string): void {
    this.logger.error(message, { trace });
    super.error(message, trace);
  }

  warn(message: string): void {
    this.logger.warn(message);
    super.warn(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
    super.debug(message);
  }
}
