# Compose Watcher

// TODO

## Requirements

- `docker compose`
- `git`

## Configuration

### Environment Variables

- `LOG` (default: `debug`)
  - `debug`, `info`, `warning`, `error`
- `INTERVAL` (default: `86400`)
  - pull interval in seconds
  - `-1` to disable interval
- `PORT` (default: `80`)
  - webhook port, -1 to disable
- `HOSTNAME` (default: `127.0.0.1`)
