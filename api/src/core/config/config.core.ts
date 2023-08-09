import { ValidationError } from '@lib/core';
import { Injectable, Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { validateSync } from '../../utils/validation.utils';
import { ConfigDto, ENVIRONMENT } from './config.model';

@Injectable()
export class ConfigProvider implements ConfigDto {
    readonly IS_TEST: boolean;
    readonly IS_DEV: boolean;
    readonly DB_ADDRESS: string;
    readonly DB_USER: string;
    readonly DB_PASSWORD: string;
    readonly DB_NAME: string;
    readonly DB_PORT: number;
    readonly JWT_SECRET: string;
    readonly JWT_EXPIRES_IN: string;
    readonly JWT_REFRESH_TOKEN_EXPIRATION_TIME: string;
    readonly JWT_REFRESH_TOKEN_SECRET: string;
    readonly DOMAIN: string;
    readonly PORT_API: number;
    readonly ENVIRONMENT: ENVIRONMENT;

    constructor() {
        const isDev = process.env.NODE_ENV === 'development';
        const devEnvPath = path.join(process.cwd(), `env/dev.env`);
        const env: Partial<ConfigDto> = isDev
            ? dotenv.parse(fs.readFileSync(devEnvPath))
            : (process.env as Partial<ConfigDto>);

        const envValidation = validateSync(ConfigDto, env);
        if (envValidation.status === 'fail') {
            throw new ValidationError(
                'Error while parsing configuration',
                envValidation.errors,
                env,
            );
        }

        this.IS_DEV = isDev;
        this.IS_TEST = process.env.TEST === 'true';
        this.DB_ADDRESS = envValidation.value.DB_ADDRESS;
        this.DB_USER = envValidation.value.DB_USER;
        this.DB_PASSWORD = envValidation.value.DB_PASSWORD;
        this.DB_NAME = envValidation.value.DB_NAME;
        this.DB_PORT = envValidation.value.DB_PORT;
        this.JWT_SECRET = envValidation.value.JWT_SECRET;
        this.JWT_EXPIRES_IN = envValidation.value.JWT_EXPIRES_IN;
        this.JWT_REFRESH_TOKEN_EXPIRATION_TIME =
            envValidation.value.JWT_REFRESH_TOKEN_EXPIRATION_TIME;
        this.JWT_REFRESH_TOKEN_SECRET = envValidation.value.JWT_REFRESH_TOKEN_SECRET;
        this.PORT_API = envValidation.value.PORT_API;
        this.DOMAIN = isDev ? `http://localhost:${this.PORT_API}` : ''; //TODO: add staging url
        this.ENVIRONMENT = envValidation.value.ENVIRONMENT;

        process.env[
            'DATABASE_URL'
        ] = `postgres://${this.DB_USER}:${this.DB_PASSWORD}@${this.DB_ADDRESS}:${this.DB_PORT}/${this.DB_NAME}`;
    }
}

@Module({
    providers: [ConfigProvider],
    exports: [ConfigProvider],
})
export class Config {}
