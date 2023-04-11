import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: process.env.LOG ?? 'info',
  format: format.combine(format.timestamp(), format.printf(info => `${info.timestamp} | ${info.level} | ${info.message}`)),
  transports: [new transports.Console()]
});

