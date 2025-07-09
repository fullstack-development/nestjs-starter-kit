import { EnvConfig } from '../config/config.model';

export const EnvConfigMock: EnvConfig = {
    DB_NAME: 'db',
    DB_HOST: 'localhost',
    DB_USERNAME: 'admin',
    DB_PASSWORD: 'pass',
    DB_PORT: 5432,
    PORT: 3000,
    JWT_SECRET: 'jwtSecret',
    JWT_EXPIRES_IN: '10min',
    JWT_REFRESH_SECRET: 'jwtRefreshSecret',
    JWT_REFRESH_EXPIRES_IN: '2days',
    DOMAIN: 'http://localhost:3000',
};
