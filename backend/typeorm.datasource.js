const { DataSource } = require('typeorm');
const { config } = require('dotenv');
const { resolve } = require('path');

const env = config({ path: resolve(__dirname, 'typeorm.env') }); //

function getConfig() {
    return new DataSource({
        type: 'postgres',
        host: env?.parsed['DB_HOST'],
        port: +env?.parsed['DB_PORT'],
        username: env?.parsed['DB_USERNAME'],
        password: env?.parsed['DB_PASSWORD'],
        database: env?.parsed['DB_NAME'],
        migrations: [resolve(__dirname, 'libs/repository/src/migrations/*.js')],
        entities: [resolve(__dirname, 'dist/libs/repository/repository/src/entities/**/*.entity.js')],
        synchronize: false,
    });
}

module.exports = getConfig();
