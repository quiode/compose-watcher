import { spawnSync } from 'child_process';

export function upAll(file: string) {
  dockerExec('up -d', file);
}

export function pullAll(file: string) {
  dockerExec('pull', file);
}

function dockerExec(command: string, file: string) {
  spawnSync('docker compose --file ' + file + " " + command);
}