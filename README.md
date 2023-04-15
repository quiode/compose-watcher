# Compose Watcher

// TODO

## Requirements

- `docker compose`
- `git`

## Configuration

### .watcherignore

If a `.watcherignore` file is found next to a `docker-compose` file, the `docker-compose` file gets skipped.

Usefull when hosting the compose-watcher instance in the same repository as the other compose files.

### .watcher-{x}

If a file with the name `.watcher-{x}` if found, where x is a number (`.watcher-1`), the docker compose files get executed in the order of the numbers (1, 2, 3). Docker compose files wihout a `.watcher-{x}` file get executed last.

### Environment Variables

- `LOG` (default: `info`)
  - `debug`, `info`, `warning`, `error`
- `INTERVAL` (default: `86400`)
  - pull interval in seconds
  - `-1` to disable interval
- `PORT` (default: `80`)
  - webhook port, -1 to disable
- `HOSTNAME` (default: `127.0.0.1`)
- `GIT_DIR` (default: `./repository`)
  - GIT Repository Diretory
- `REMOTE_URL` (default: `''`)
  - URL of the REMOTE, needed when no git directory exists

## TODO

- GitHub CI Action
