import path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Injectable, Module } from '@nestjs/common';
import { ConfigDto } from './config.model';
import { validateSync } from '../../utils/validation.utils';
import { ValidationError } from '../../model/errors.model';

@Injectable()
export class ConfigServiceProvider implements ConfigDto {
    readonly IS_TEST: boolean;
    readonly IS_DEV: boolean;
    readonly DB_ADDRESS: string;
    readonly DB_USER: string;
    readonly DB_PASSWORD: string;
    readonly DB_NAME: string;
    readonly DB_PORT: number;
    readonly JWT_SECRET: string;
    readonly JWT_EXPIRES_IN: string;
    readonly DOMAIN: string;
    readonly PORT_API: number;

    constructor() {
        const isDev = process.env.NODE_ENV === 'development';
        const devEnvPath = path.join(process.cwd(), `env/dev.env`);
        const env: Partial<ConfigDto> = isDev
            ? dotenv.parse(fs.readFileSync(devEnvPath))
            : process.env;

        const envValidation = validateSync(ConfigDto, env);
        if (envValidation.status === 'fail') {
            throw new ValidationError(
                'Error while parsing configuration',
                envValidation.errors,
                env,
            );
        }

        this.IS_TEST = envValidation.value.IS_TEST;
        this.IS_DEV = envValidation.value.IS_DEV;
        this.DB_ADDRESS = envValidation.value.DB_ADDRESS;
        this.DB_USER = envValidation.value.DB_USER;
        this.DB_PASSWORD = envValidation.value.DB_PASSWORD;
        this.DB_NAME = envValidation.value.DB_NAME;
        this.DB_PORT = envValidation.value.DB_PORT;
        this.JWT_SECRET = envValidation.value.JWT_SECRET;
        this.JWT_EXPIRES_IN = envValidation.value.JWT_EXPIRES_IN;
        this.PORT_API = envValidation.value.PORT_API;
        this.DOMAIN = isDev ? `http://localhost:${this.PORT_API}` : 'https://staging.teraswap.ru';
    }
}

@Module({
    providers: [ConfigServiceProvider],
    exports: [ConfigServiceProvider],
})
export class ConfigService {}
