import { spawn } from 'child_process';
import commandExists from 'command-exists';

export function upAll(file: string, log: boolean) {
  return dockerExec('up -d', file, log);
}

export function pullAll(file: string, log: boolean) {
  return dockerExec('pull', file, log);
}

function dockerExec(command: string, file: string, log: boolean): Promise<void> {
  return new Promise((resolve, reject): void => {
    let compose = 'docker compose';

    if (!commandExists.sync(compose)) {
      compose = 'docker-compose';

      if (!commandExists.sync(compose)) {
        Promise.reject('docker compose not found!');
      }
    }

    const childProc = spawn([compose, '--file', file, command].join(" "));

    childProc.on('error', (err): void => {
      reject(err)
    });

    const result = {
      exitCode: null as number | null,
      err: '',
      out: ''
    };

    childProc.stdout.on('data', (chunk): void => {
      result.out += chunk.toString()
    });

    childProc.stderr.on('data', (chunk): void => {
      result.err += chunk.toString()
    });

    childProc.on('exit', (exitCode): void => {
      result.exitCode = exitCode
      if (exitCode === 0) {
        resolve(result);
      } else {
        reject(result);
      }
    });

    if (log) {
      childProc.stdout.pipe(process.stdout);
      childProc.stderr.pipe(process.stderr);
    };
  })
}