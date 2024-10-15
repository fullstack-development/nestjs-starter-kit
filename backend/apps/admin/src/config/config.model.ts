import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class ConfigModel {
    @IsString()
    DB_NAME: string;

    @IsString()
    DB_HOST: string;

    @IsString()
    DB_USERNAME: string;

    @IsString()
    DB_PASSWORD: string;

    @IsNumber()
    @Transform((p) => Number(p.value))
    DB_PORT: number;

    @IsNumber()
    @Transform((p) => Number(p.value))
    PORT: number;

    @IsString()
    JWT_SECRET: string;

    @IsString()
    JWT_EXPIRES_IN: string;
}
