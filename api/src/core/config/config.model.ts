import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';

export enum ENVIRONMENT {
    LOCAL = 'local',
    STAGE = 'stage',
    PROD = 'prod',
}

export class ConfigDto {
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

    @IsString()
    JWT_REFRESH_TOKEN_EXPIRATION_TIME: string;

    @IsString()
    JWT_REFRESH_TOKEN_SECRET: string;

    @Type(() => Number)
    @IsInt()
    PORT_API: number;

    @IsEnum(ENVIRONMENT)
    ENVIRONMENT: ENVIRONMENT;
}
