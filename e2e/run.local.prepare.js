const cp = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

const std = {
    log: (data) => console.log(data),
    info: (header, body = '') => console.info(`\x1b[36m%s\x1b[0m${body}`, header),
    error: (header, body = '') => console.error(`\x1b[31m%s\x1b[0m${body}`, header),
};

function exec(command, args, opts) {
    return new Promise((res, rej) => {
        const proc = cp.spawn(command, args, {
            shell: true,
            cwd: opts?.cwd,
            stdio: opts?.stdio,
        });
        proc.stdout?.on('data', (data) => {
            std.log(data.toString().replace(/^\s+|\s+$/g, ''));
        });
        proc.stderr?.on('data', (data) => {
            const msg = data.toString().replace(/^\s+|\s+$/g, '');
            if (opts?.ignoreError) {
                std.log(msg);
            } else {
                std.error(msg);
            }
        });
        proc.on('exit', (code) => {
            if (code === 0 || opts?.ignoreError) {
                res();
            } else {
                proc.kill('SIGTERM');
                rej(code);
            }
        });
    });
}

function sleep(ms) {
    return new Promise((res) => {
        setTimeout(res, ms);
    });
}

async function run() {
    const { error: envError, parsed: env } = dotenv.config('./env');
    if (envError) {
        std.error('Cannot parse .env');
        throw envError;
    }
    env[
        'DATABASE_URL'
    ] = `postgres://${env['DB_USER']}:${env['DB_PASS']}@${env['DB_HOST']}:${env['DB_PORT']}/${env['DB_NAME']}`;
    for (const e of Object.keys(env)) {
        process.env[e] = env[e];
    }

    //#region POSTGRESQL DATABASE
    std.info('Start pg database');
    const containerName = `${process.env['DB_NAME']}_test`;
    await exec('docker', ['container', 'stop', containerName], { ignoreError: true });
    await exec('docker', ['container', 'rm', containerName], { ignoreError: true });
    await exec('docker', [
        'run',
        '-p',
        `${env['DB_PORT']}:5432`,
        '--name',
        containerName,
        '-e',
        `POSTGRES_USER=$DB_USER`,
        '-e',
        `POSTGRES_PASSWORD=$DB_PASS`,
        '-e',
        `POSTGRES_DB=$DB_NAME`,
        '-d',
        'postgres',
    ]);
    let pgReady = false;
    let pgTimeout = 0;
    do {
        try {
            await exec('docker', ['exec', containerName, 'pg_isready']);
            pgReady = true;
        } catch {
            await sleep(500);
            pgTimeout += 1;
        }
    } while (!pgReady || pgTimeout >= 10);
    if (pgTimeout >= 10) {
        throw 'Cannot create PG container';
    }
    // #endregion

    // #region  GENERATE PRISMA
    std.info('\nGenerate prisma');
    await exec('yarn', ['prisma:generate'], { cwd: __dirname });
    // #endregion

    // #region  POSTGRESQL PRISMA MIGRATIONS
    std.info('\nDeploy prisma migrations');
    await exec('yarn', ['prisma:prepare'], { cwd: path.join(__dirname, '../api') });
    await exec('yarn', ['prisma:migrate:deploy'], { cwd: path.join(__dirname, '../api') });
    // #endregion
}
run();
