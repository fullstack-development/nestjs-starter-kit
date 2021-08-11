import { IsString, IsBoolean, IsInt } from 'class-validator';
import { IConfig, IDatabaseConfig, IJwtConfig } from './config.model';

export class ConfigDto implements IDatabaseConfig, IConfig, IJwtConfig {
    @IsBoolean()
    IS_TEST: boolean;

    @IsBoolean()
    IS_DEV: boolean;

    @IsString()
    DB_ADDRESS: string;

    @IsString()
    DB_USER: string;

    @IsString()
    DB_PASSWORD: string;

    @IsString()
    DB_NAME: string;

    @IsInt()
    DB_PORT: number;

    @IsString()
    JWT_SECRET: string;

    @IsString()
    JWT_EXPIRES_IN: string;
}
