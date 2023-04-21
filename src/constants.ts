export const WATCHER_INTERVAL = Number.isNaN(Number(process.env.WATCHER_INTERVAL)) ? 86400 : Number(process.env.WATCHER_INTERVAL);

export const WATCHER_PORT = Number.isNaN(Number(process.env.WATCHER_PORT)) ? 80 : Number(process.env.WATCHER_PORT);

export const WEBHOOK = WATCHER_PORT > 0;

export const WATCHER_HOSTNAME = process.env.WATCHER_HOSTNAME ?? '127.0.0.1';

export const WATCHER_LOG: 'info' | 'debug' | 'warning' | 'error' | string = process.env.WATCHER_LOG ?? 'info';

export const WATCHER_REPO_DIR = process.env.WATCHER_REPO_DIR ?? process.cwd() + '/../repository';

export const WATCHER_REMOTE_URL = process.env.WATCHER_REMOTE_URL ?? '';

export const WATCHER_WEBHOOK_SECRET = process.env.WATCHER_WEBHOOK_SECRET ?? '';

export const WATCHER_TELEGRAM_TOKEN = process.env.WATCHER_TELEGRAM_TOKEN ?? '';

export const WATCHER_CHAT_ID = Number(process.env.WATCHER_CHAT_ID ?? '');