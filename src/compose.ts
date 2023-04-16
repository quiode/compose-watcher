import { spawn } from 'child_process';
import commandExists from 'command-exists';

interface ComposeResult {
  exitCode: number | null;
  err: string;
  out: string;
}

export function upAll(file: string, log: boolean) {
  return dockerExec('up -d', file, log);
}

export function pullAll(file: string, log: boolean) {
  return dockerExec('pull', file, log);
}

function dockerExec(command: string, file: string, log: boolean): Promise<ComposeResult> {
  return new Promise((resolve, reject): void => {
    let compose = 'docker compose';

    if (!commandExists.sync(compose)) {
      compose = 'docker-compose';

      if (!commandExists.sync(compose)) {
        Promise.reject('docker compose not found!');
      }
    }

    const finalCommand = [compose, '--file', file, command].join(" ");

    if (log) {
      console.log("Docker Compose Command: ", finalCommand);
    }

    const childProc = spawn(finalCommand);

    childProc.on('error', (err): void => {
      reject(err)
    });

    const result: ComposeResult = {
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