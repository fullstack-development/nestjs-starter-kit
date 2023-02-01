import { spawn, StdioOptions } from 'child_process';
import { std } from './std.utils';

type Options = {
    cwd?: string;
    stdio?: StdioOptions;
    ignoreError?: boolean;
    env?: NodeJS.ProcessEnv;
};

export function exec(command: string, args?: Array<string>, opts?: Options) {
    return new Promise((res, rej) => {
        const proc = spawn(command, args || [], {
            shell: true,
            cwd: opts?.cwd,
            stdio: opts?.stdio,
            env: opts?.env,
        });
        proc.stdout?.on('data', (data: Buffer) => {
            std.log(data.toString().replace(/^\s+|\s+$/g, ''));
        });
        proc.stderr?.on('data', (data: Buffer) => {
            const msg = data.toString().replace(/^\s+|\s+$/g, '');
            if (opts?.ignoreError) {
                std.log(msg);
            } else {
                std.error(msg);
            }
        });
        proc.on('exit', (code: number) => {
            if (code === 0 || opts?.ignoreError) {
                res(undefined);
            } else {
                proc.kill('SIGTERM');
                rej(code);
            }
        });
    });
}
