import { logger } from './logger';

export function main() {
  logger.log({
    message: 'Hello World!',
    level: 'info'
  });
}

main();