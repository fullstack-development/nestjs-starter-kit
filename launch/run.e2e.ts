import * as dotenv from 'dotenv';
import * as path from 'path';
import { exec } from './scripts/utils/child_process.utils';
import { std } from './scripts/utils/std.utils';

async function run() {
    const projectName = 'stk_e2e';
    const composeYaml = path.resolve(__dirname, '../stk.docker-compose.yaml');
    const { error: envError, parsed: env } = dotenv.config({
        path: path.resolve(__dirname, '.e2e.env'),
    });
    if (envError || !env) {
        std.error('Cannot parse .env');
        if (envError) throw envError;
        if (!env) throw `Actual env: ${env}`;
    }
    env[
        'DATABASE_URL'
    ] = `postgres://${env['DB_USER']}:${env['DB_PASS']}@${env['DB_HOST']}:${env['DB_PORT']}/${env['DB_NAME']}`;
    for (const e of Object.keys(env)) {
        process.env[e] = env[e];
    }

    //#region PRISMA
    std.info('\nBuild prisma');
    await exec('yarn', ['install', '--frozen-lockfile'], {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '../libs/repository'),
    });
    await exec('yarn', ['prisma:generate'], {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '../libs/repository'),
    });
    // #endregion

    //#region POSTGRESQL DATABASE
    std.info('\nRestart test containers');
    await exec('docker', ['compose', '-p', projectName, '-f', composeYaml, 'stop'], {
        stdio: 'inherit',
        ignoreError: true,
    });
    await exec('docker', ['compose', '-p', projectName, '-f', composeYaml, 'rm', '-f'], {
        stdio: 'inherit',
        ignoreError: true,
    });
    await exec('docker', ['compose', '-p', projectName, '-f', composeYaml, 'up', '-d', '--build'], {
        stdio: 'inherit',
    });
    // #endregion

    // #region POSTGRESQL PRISMA MIGRATIONS
    std.info('\nDeploy prisma migrations');
    await exec('yarn', ['prisma:migrate:deploy'], {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '../libs/repository'),
    });
    // #endregion

    // #region TEST
    std.info('\nCapture test files from args');
    const testFiles = process.argv.filter((a) => a.match(/^.*\.spec\.ts$/) !== null);
    const testRegex = '(' + testFiles.map((f) => `/${f}`).join('|') + ')';

    if (testFiles.length > 0) {
        std.info('\nTesting files:');
        testFiles.forEach(std.log);
    }

    std.info('\nRun tests');
    await exec(
        'yarn',
        ['test', '--runInBand', testFiles.length > 0 ? `--testRegex=${testRegex}` : ''],
        {
            stdio: 'inherit',
            cwd: path.resolve(__dirname, '../e2e'),
            env: {
                ...process.env,
                API_ADDRESS: 'localhost',
                API_PORT: env['PORT_API'] || '3000',
            },
        },
    );
    // #endregion
}
run();
