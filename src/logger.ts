import { createLogger, format, transports } from "winston";
import { LOG } from './constants';

const logger = createLogger({
  level: LOG,
  format: format.combine(format.timestamp(), format.printf(info => `${info.timestamp} | ${info.level} | ${info.message}`)),
  transports: [new transports.Console()]
});

export function logDebug(message: string) {
  logger.log({
    level: 'debug',
    message
  });
}

export function logInfo(message: string) {
  logger.log({
    level: 'info',
    message
  });
}

export function logWarn(message: string) {
  logger.log({
    level: 'warn',
    message
  });
}

export function logError(message: string) {
  logger.log({
    level: 'error',
    message
  });
}

/**
 * log error, then exit
 */
export function errorAndExit(message: string) {
  logger.log({
    level: 'error',
    message
  });
  process.exit(1);
}
