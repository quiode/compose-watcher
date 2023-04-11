export const INTERVAL = Number.isNaN(Number(process.env.INTERVAL)) ? 86400 : Number(process.env.INTERVAL);

export const PORT = Number.isNaN(Number(process.env.PORT)) ? 80 : Number(process.env.PORT);

export const WEBHOOK = PORT > 0;

export const HOSTNAME = process.env.HOSTNAME ?? '127.0.0.1';