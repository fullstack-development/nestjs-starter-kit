export interface IDatabaseConfig {
    readonly DB_ADDRESS: string;
    readonly DB_USER: string;
    readonly DB_PASSWORD: string;
    readonly DB_NAME: string;
    readonly DB_PORT: number;
}

export interface IConfig {
    IS_DEV: boolean;
    IS_TEST: boolean;
}

export interface IJwtConfig {
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
}
