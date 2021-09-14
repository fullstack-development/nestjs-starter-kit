export type DatabaseConfig = {
    DB_ADDRESS: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_PORT: number;
};

export type Config = {
    IS_DEV: boolean;
    IS_TEST: boolean;
    DOMAIN: string;
    PORT_API: number;
};

export type JwtConfig = {
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
};
