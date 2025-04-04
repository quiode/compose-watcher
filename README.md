# Compose Watcher

Watches a Git Repository containing docker-compose files and updates the running containers when new updates exist. Can be either configured using an interval, a webhook or both.
If no Repository exists, clones a new repository and starts all services.
Each time the git repository gets pulled, *all* services get pulled and restarted.

## Requirements

- `docker compose`
- `git`

## Quick Setup

### Docker Compose

```text
version: '3.9'

services:
  compose-watcher:
    image: "quiooo/compose-watcher"
    environment:
      WATCHER_PORT: "-1"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /home/your-username/repo:/app/repository:rw
    restart: always
```

## Webhook

- Server Listens on Port 80, but can be customized
- add url pointing to the docker container to your repository webhooks and listen to push events.
- the applications runs the update checker on every webhook push

## Configuration

### Secrets

If the `WATCHER_WEBHOOK_SECRET` environment variable is set, the application checks the webhooks for a secret. More can be found at <https://docs.github.com/en/webhooks-and-events/webhooks/securing-your-webhooks>.

### .watcherignore

If a `.watcherignore` file is found next to a `docker-compose` file, the `docker-compose` file gets skipped.

Usefull when hosting the compose-watcher instance in the same repository as the other compose files.

### .watcher-{x}

If a file with the name `.watcher-{x}` if found, where x is a number (`.watcher-1`), the docker compose files get executed in the order of the numbers (1, 2, 3). Docker compose files wihout a `.watcher-{x}` file get executed last.

### Environment Variables

- `WATCHER_LOG` (default: `info`)
  - `debug`, `info`, `warning`, `error`
  - Set in Dockerfile
- `WATCHER_INTERVAL` (default: `86400`)
  - pull interval in seconds
  - `-1` to disable interval
- `WATCHER_PORT` (default: `80`)
  - webhook port, -1 to disable
  - Set in Dockerfile
- `WATCHER_HOSTNAME` (default: `127.0.0.1`)
  - Set in Dockerfile
- `WATCHER_REPO_DIR` (default: `./repository`)
  - GIT Repository Diretory
  - Set in Dockerfile
- `WATCHER_REMOTE_URL` (default: `''`)
  - URL of the REMOTE, needed when no git directory exists
- `WATCHER_WEBHOOK_SECRET` (default: `''`)
  - if set, check webhook (improves security)
  - see: <https://docs.github.com/en/webhooks-and-events/webhooks/securing-your-webhooks>
- `WATCHER_TELEGRAM_TOKEN` (default: `''`)
  - token for optional telegram bot
  - both `WATCHER_CHAT_ID` and `WATCHER_TELEGRAM_TOKEN` have to be set to enable telegram notification
- `WATCHER_CHAT_ID` (default: `''`)
  - chat id for optional telegram bot
  - both `WATCHER_CHAT_ID` and `WATCHER_TELEGRAM_TOKEN` have to be set to enable telegram notification

### Volumes

- `/var/run/docker.sock`
  - docker socket, required to run
  - read only
- `/app/repository`
  - the git repository
  - read and write
- `/root/.ssh`
  - ssh, if the repo needs ssh
  - read only

## Example Folder Structure of WATCHER_REMOTE_URL Repo

```text
project-1
  docker-compose.yml
procjet-2
  docker-compose.yml
  .watcher-2
watcher
  docker-compose-yml
  .watcherignore
```

## Notice

### Relative Paths

Relative Volume Paths mostly won't work. They will only work when the local repository path and the repository path inside the container match.
