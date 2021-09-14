import path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Injectable, Module } from '@nestjs/common';
import { Config, DatabaseConfig, JwtConfig } from './config.model';
import { ConfigDto } from './config.dto';
import { validateSync } from '../../utils/validation.utils';
import { ValidationError } from '../../model/errors.model';

@Injectable()
export class ConfigServiceProvider implements DatabaseConfig, Config, JwtConfig {
    IS_TEST: boolean;
    IS_DEV: boolean;
    DB_ADDRESS: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_PORT: number;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;

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
    }
}

@Module({
    providers: [ConfigServiceProvider],
    exports: [ConfigServiceProvider],
})
export class ConfigService {}
