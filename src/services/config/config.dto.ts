import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsInt } from 'class-validator';
import { Config, DatabaseConfig, JwtConfig } from './config.model';

export class ConfigDto implements DatabaseConfig, Omit<Config, 'DOMAIN'>, JwtConfig {
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

    @Type(() => Number)
    @IsInt()
    DB_PORT: number;

    @IsString()
    JWT_SECRET: string;

    @IsString()
    JWT_EXPIRES_IN: string;

    @Type(() => Number)
    @IsInt()
    PORT_API: number;
}
