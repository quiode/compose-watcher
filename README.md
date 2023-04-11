# Compose Watcher

// TODO

## Requirements

- `docker compose`
- `git`

## Configuration

### .watcherignore

If a `.watcherignore` file is found next to a `docker-compose` file, the `docker-compose` file gets skipped.

Usefull when hosting the compose-watcher instance in the same repository as the other compose files.

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
