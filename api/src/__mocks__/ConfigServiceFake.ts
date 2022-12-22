import { ConfigDto, ENVIRONMENT } from '../core/config/config.model';

export class ConfigServiceFake implements ConfigDto {
    IS_DEV: boolean;
    IS_TEST: boolean;
    DB_ADDRESS: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_PORT: number;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_TOKEN_EXPIRATION_TIME: string;
    JWT_REFRESH_TOKEN_SECRET: string;
    PORT_API: number;
    DOMAIN: string;
    ENVIRONMENT: ENVIRONMENT;
    constructor() {
        this.IS_DEV = true;
        this.IS_TEST = true;
        this.DB_ADDRESS = 'fake url';
        this.DB_USER = 'user';
        this.DB_PASSWORD = 'password';
        this.DB_NAME = 'dbName';
        this.DB_PORT = 8080;
        this.JWT_SECRET = 'jwtSecret';
        this.JWT_EXPIRES_IN = '10 min';
        this.JWT_REFRESH_TOKEN_EXPIRATION_TIME = '2 days';
        this.JWT_REFRESH_TOKEN_SECRET = 'jwtRefreshSecret';
        this.PORT_API = 3000;
        this.DOMAIN = `http://localhost:${this.PORT_API}`;
        this.ENVIRONMENT = ENVIRONMENT.LOCAL;
    }
}
