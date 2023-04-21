import { createLogger, format, transports } from "winston";
import { LOG, WATCHER_CHAT_ID, WATCHER_TELEGRAM_TOKEN } from './constants';
import TelegramLogger from "winston-telegram";

const logger = createLogger({
  level: LOG,
  format: format.combine(format.timestamp(), format.printf(info => `${info.timestamp} | ${info.level} | ${info.message}`)),
  transports: [new transports.Console()]
});

if (WATCHER_TELEGRAM_TOKEN && WATCHER_CHAT_ID) {
  logger.add(new TelegramLogger({
    chatId: WATCHER_CHAT_ID,
    token: WATCHER_TELEGRAM_TOKEN
  }));
}

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
