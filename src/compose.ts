import { spawn } from 'child_process';
import { getDir } from './helper';

interface ComposeResult {
  exitCode: number | null;
  err: string;
  out: string;
}

export function upAll(file: string, log: boolean) {
  return dockerExec(file, log, 'up', '-d');
}

export function pullAll(file: string, log: boolean) {
  return dockerExec(file, log, 'pull');
}

function dockerExec(file: string, log: boolean, command: string, ...args: string[]): Promise<ComposeResult> {
  return new Promise((resolve, reject): void => {
    const combined_args: string[] = ['compose', '--file', file, command, ...args];

    if (log) {
      console.log("Docker Compose Command: docker", combined_args.join(" "));
    }

    const childProc = spawn('docker', combined_args, {
      cwd: getDir(file)
    });

    childProc.on('error', (err): void => {
      reject(err);
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