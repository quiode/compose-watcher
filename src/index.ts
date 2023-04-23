import { createServer } from 'http';
import { WATCHER_REPO_DIR, WATCHER_HOSTNAME, WATCHER_INTERVAL, WATCHER_LOG, WATCHER_PORT, WATCHER_REMOTE_URL, WEBHOOK, WATCHER_WEBHOOK_SECRET } from './constants';
import { errorAndExit, logDebug, logError, logInfo, logWarn } from './logger';
import { Glob } from 'glob';
import { git } from './git';
import { existsSync } from 'fs';
import { pullAll, upAll } from './compose';
import { createHash, createHmac, getDiffieHellman } from 'crypto';
import { getDir } from './helper';

export default function main() {
  if (!WATCHER_INTERVAL && !WEBHOOK) {
    errorAndExit('No webhook and no interval is defined. Shutting down!');
  }

  if (WATCHER_INTERVAL > 0) {
    setInterval(onRepoUpdate, WATCHER_INTERVAL * 1000);
    logInfo(`Checking every ${WATCHER_INTERVAL} seconds`);
  }

  if (WEBHOOK) {
    // start server
    const server = createServer(async (req, res) => {
      logDebug("Webhook update received!");
      const buffers = [] as Uint8Array[];

      for await (const chunk of req) {
        buffers.push(chunk);
      }

      const data = Buffer.concat(buffers).toString();

      // check webhook
      if (!checkWebhook(req.headers["x-hub-signature-256"] as string | undefined ?? '', data)) {
        logWarn('Request hash is invalid. Ingoring request!');
        return;
      }

      onRepoUpdate();
      res.writeHead(200).end();
    });
    server.listen(WATCHER_PORT, WATCHER_HOSTNAME, () => {
      logInfo(`Server running at http://${WATCHER_HOSTNAME}:${WATCHER_PORT}`);
    });
  }
}

/**
 *  returns true if request hash is correct
 *  */
function checkWebhook(header: string, payload: string): boolean {
  // if secret is not set, don0t check
  if (!WATCHER_WEBHOOK_SECRET) {
    return true;
  }

  const payloadHash = createHmac('sha256', WATCHER_WEBHOOK_SECRET).update(payload).digest('hex');
  return header === 'sha256=' + payloadHash;
}

async function onRepoUpdate() {
  logDebug('Updating Repository...');
  // timer start
  const startTime = new Date();
  let update_count = 0;
  let error_count = 0;

  // if repo is new, always execute compose up
  let newRepo = false;

  // Check if Repo doesn't exist, clone repo
  if (!(await git.checkIsRepo())) {
    logWarn(`No git repository found in ${WATCHER_REPO_DIR}. Creating a new one with url ${WATCHER_REMOTE_URL}.`);

    try {
      await git.clone(WATCHER_REMOTE_URL, WATCHER_REPO_DIR);
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

  // fetch
  try {
    await git.fetch();
  } catch (error) {
    errorAndExit("Error while fetching git repo!");
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
    const glob = new Glob('**/docker-compose.{yml,yaml}', { cwd: WATCHER_REPO_DIR, nodir: true, absolute: true });

    // .watcher-{x}
    // loop through all glob files and assign each a number (-1 if no .watcher-x annotation)
    const files: { file: string, order: number }[] = [];
    for (const file of glob) {
      const dir = getDir(file);
      // check for watcher file
      if (existsSync(dir + '.watcherignore')) {
        logDebug(`Found a .watcherignore file, skipping directory (${dir})!`);
        continue;
      }

      const watcherGLob = new Glob(dir + '.watcher-+(0|1|2|3|4|5|6|7|8|9)', { cwd: WATCHER_REPO_DIR, nodir: true, absolute: true });
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
          order
        });
      } else {
        files.push({
          file,
          order: -1
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

      let err_count = 0;
      let success = false;
      while (!success) {
        try {
          // compose pull
          await pullAll(file.file, WATCHER_LOG === 'debug');
          success = true;
        } catch {
          err_count++;
          if (err_count > 3) {
            errorAndExit("Error while running compose up!");
            logDebug("File: " + JSON.stringify(file));
            logError("Error while pulling image for: " + file.file);
            error_count++;
            continue;
          }
        }
      }

      try {
        // compose up
        await upAll(file.file, WATCHER_LOG === 'debug');
      } catch {
        logDebug("File: " + JSON.stringify(file));
        logError('Error while running compose up for: ' + file.file);
        error_count++;
        continue;
      }

      update_count++;
    }

    // timer end
    const time_diff = Math.round(((new Date()).getTime() - startTime.getTime()) / 1000);
    logInfo(`Updated ${update_count} compose files in ${time_diff} seconds with ${error_count} errors!`);
  } else {
    logDebug("No changes found.");
  }
}

main();