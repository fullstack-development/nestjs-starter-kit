import { Client } from 'pg';

export const createDbClient = () =>
    new Client({
        host: process.env['DB_HOST'],
        port: parseInt(process.env['DB_PORT'] || ''),
        user: process.env['DB_USER'],
        database: process.env['DB_NAME'],
        password: process.env['DB_PASS'],
    });
