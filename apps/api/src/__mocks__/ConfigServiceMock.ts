import { ConfigModel } from '../config/config.model';

export class ConfigServiceMock implements ConfigModel {
    DB_NAME: string;
    DB_HOST: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_PORT: number;
    PORT: number;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES_IN: string;
    DOMAIN: string;

    constructor() {
        this.DB_NAME = 'db';
        this.DB_HOST = 'localhost';
        this.DB_USERNAME = 'admin';
        this.DB_PASSWORD = 'pass';
        this.DB_PORT = 5432;
        this.PORT = 3000;
        this.JWT_SECRET = 'jwtSecret';
        this.JWT_EXPIRES_IN = '10min';
        this.JWT_REFRESH_SECRET = 'jwtRefreshSecret';
        this.JWT_REFRESH_EXPIRES_IN = '2days';
        this.DOMAIN = `http://localhost:${this.PORT}`;
    }
}
