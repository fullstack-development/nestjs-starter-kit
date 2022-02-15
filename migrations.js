/* eslint-disable */

const fs = require('fs');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');
const process = require('process');

const args = process.argv.slice(2);
const kind = args[0];

if (kind !== 'run' && kind !== 'revert') {
    throw new Error('First argument should be "run" or "revert"');
}

const isDev = args[1] === '--dev';
const devEnvPath = path.join(process.cwd(), `env/dev.env`);
const env = isDev ? dotenv.parse(fs.readFileSync(devEnvPath)) : process.env;
const configFile = path.join(__dirname, 'ormconfig.json');

async function main() {
    fs.writeFileSync(
        configFile,
        JSON.stringify([
            {
                type: 'postgres',
                host: env.DB_ADDRESS,
                port: env.DB_PORT,
                username: env.DB_USER,
                password: env.DB_PASSWORD,
                database: env.DB_NAME,
                entities: ['**/*.entity.js'],
                synchronize: true,
                migrations: ['migrations/*.js'],
                migrationsTableName: 'migrations_typeorm',
                migrationsRun: true,
            },
        ]),
    );

    try {
        await new Promise((res) => {
            execSync(`npx typeorm migration:${kind}`, {
                cwd: process.cwd(),
                detached: true,
                stdio: 'inherit',
            });
            res();
        });
    } catch (e) {
        throw e;
    } finally {
        fs.rmSync(configFile);
    }
}
main();
