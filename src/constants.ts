export const INTERVAL = Number.isNaN(Number(process.env.INTERVAL)) ? 86400 : Number(process.env.INTERVAL);

export const PORT = Number.isNaN(Number(process.env.PORT)) ? 80 : Number(process.env.PORT);

export const WEBHOOK = PORT > 0;

export const HOSTNAME = process.env.HOSTNAME ?? '127.0.0.1';

export const LOG: 'info' | 'debug' | 'warning' | 'error' | string = process.env.LOG ?? 'info';

export const GIT_DIR = process.env.GIT_DIR ?? process.cwd() + '/../repository';

export const REMOTE_URL = process.env.REMOTE_URL ?? '';