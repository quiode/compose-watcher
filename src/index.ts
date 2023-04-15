import { createServer } from 'http';
import { GIT_DIR, HOSTNAME, INTERVAL, PORT, REMOTE_URL, WEBHOOK } from './constants';
import { errorAndExit, logDebug, logInfo, logWarn } from './logger';
import { Glob } from 'glob';
import { git } from './git';
import { pullAll, upAll } from 'docker-compose';
import { existsSync } from 'fs';

export default function main() {
  if (!INTERVAL && !WEBHOOK) {
    errorAndExit('No webhook and no interval is defined. Shutting down!');
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

async function onRepoUpdate() {
  logDebug('Updating Repository...');
  // timer start
  const startTime = new Date();
  let update_count = 0;
  // Check if Repo doesn't exist, clone repo
  if (!(await git.checkIsRepo())) {
    logWarn('No git repository found. Creating a new one');

    try {
      await git.clone(REMOTE_URL);
    } catch (error) {
      logDebug('Error: ' + JSON.stringify(error ?? 'null'));
      errorAndExit('Error while trying to create a git repository, shutting down!');
    }
  }

  // if repo has changes, throw an error
  if (!(await git.status()).isClean()) {
    errorAndExit('Git repository is not clean, can\'t pull. Shutting down!');
  }

  // only deploy docker when changes exist in origin
  if ((await git.status()).behind) {
    // pull repo
    try {
      await git.pull();
    } catch (error) {
      logDebug('Error: ' + JSON.stringify(error ?? 'null'));
      errorAndExit('Error while pulling git repository. Shutting down!');
    }

    // find all docker compose files
    const glob = new Glob('**/docker-compose.{yml,yaml}', { cwd: GIT_DIR, nodir: true, absolute: true });

    // iterate through all compose files
    for (const file of glob) {
      logDebug('Update compose-file: ' + file);
      const dir = file.slice(0, file.lastIndexOf('docker-compose'));
      // check for watcher file
      if (existsSync(dir + '.watcherignore')) {
        logDebug('Found a .watcherignore file, skipping directory!');
        continue;
      }

      // compose pull
      await pullAll({ log: false, cwd: dir });
      // compose up
      await upAll({ log: false, cwd: dir });

      update_count++;
    }

    // timer end
    const time_diff = Math.round(((new Date()).getTime() - startTime.getTime()) / 1000);
    logInfo(`Updated ${update_count} compose files in ${time_diff} seconds!`);
  } else {
    logDebug("No changes found.");
  }
}

main();