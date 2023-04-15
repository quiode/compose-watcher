import { createServer } from 'http';
import { GIT_DIR, HOSTNAME, INTERVAL, LOG, PORT, REMOTE_URL, WEBHOOK } from './constants';
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

  // if repo is new, always execute compose up
  let newRepo = false;

  // Check if Repo doesn't exist, clone repo
  if (!(await git.checkIsRepo())) {
    logWarn('No git repository found. Creating a new one');

    try {
      await git.clone(REMOTE_URL, GIT_DIR);
      logDebug("New Git Repository created!");
      newRepo = true;
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
  if ((await git.status()).behind || newRepo) {
    // pull repo
    try {
      await git.pull();
    } catch (error) {
      logDebug('Error: ' + JSON.stringify(error ?? 'null'));
      errorAndExit('Error while pulling git repository. Shutting down!');
    }

    // find all docker compose files
    const glob = new Glob('**/docker-compose.{yml,yaml}', { cwd: GIT_DIR, nodir: true, absolute: true });

    // .watcher-{x}
    // loop through all glob files and assign each a number (-1 if no .watcher-x annotation)
    const files: { file: string, order: number, dir: string }[] = [];
    for (const file of glob) {
      const dir = file.slice(0, file.lastIndexOf('docker-compose'));
      // check for watcher file
      if (existsSync(dir + '.watcherignore')) {
        logDebug('Found a .watcherignore file, skipping directory!');
        continue;
      }

      const watcherGLob = new Glob(dir + '.watcher-+(0|1|2|3|4|5|6|7|8|9)', { cwd: GIT_DIR, nodir: true, absolute: true });
      const ignoreList: string[] = [];

      for (const ignoreFile of watcherGLob) {
        ignoreList.push(ignoreFile);
      }

      if (ignoreList.length > 0) {
        if (ignoreList.length > 1) {
          logWarn("Found more than one .watcher-{x} ignore file, using the first one found!");
        }

        const orderFile = ignoreList[0];
        const order = +orderFile.slice(orderFile.lastIndexOf('.watcher-') + '.watcher-'.length);

        files.push({
          file,
          order,
          dir
        });
      } else {
        files.push({
          file,
          order: -1,
          dir
        });
      }
    }
    files.sort((a, b) => {
      if (a.order === -1) return 1;
      if (b.order === -1) return -1;
      return a.order - b.order;
    });

    // iterate through all compose files
    for (const file of files) {
      logDebug('Update compose-file: ' + file.file);

      try {
        // compose pull
        await pullAll({ log: LOG === 'debug', cwd: file.dir });
        // compose up
        await upAll({ log: LOG === 'debug', cwd: file.dir });
      } catch (error: any) {
        logDebug("Error: " + error?.err ?? JSON.stringify(error));
        errorAndExit("Error while running docker compose pull/up!");
      }

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