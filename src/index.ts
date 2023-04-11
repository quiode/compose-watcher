import { createServer } from 'http';
import { HOSTNAME, INTERVAL, PORT, WEBHOOK } from './constants';
import { logDebug, logError, logInfo } from './logger';

export default function main() {
  if (!INTERVAL && !WEBHOOK) {
    logError('No webhook and no interval is defined. Shutting down!');
    process.exit(1);
  }

  if (INTERVAL > 0) {
    setInterval(onRepoUpdate, INTERVAL * 1000);
    logInfo(`Checking every ${INTERVAL} seconds`);
  }

  if (WEBHOOK) {
    // start server
    const server = createServer((req, res) => {
      onRepoUpdate();
      res.writeHead(200).end();
    });
    server.listen(PORT, HOSTNAME, () => {
      logInfo(`Server running at http://${HOSTNAME}:${PORT}`);
    });
  }
}

function onRepoUpdate() {
  logDebug('Updating Repository');
}

main();