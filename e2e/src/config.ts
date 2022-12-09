import { plainToClass, Type } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

let cfg: Config | undefined;

export const getConfig = () => {
    if (cfg === undefined) {
        const env = plainToClass(Env, process.env);
        const errors = validateSync(env);
        if (errors.length > 1) {
            throw errors;
        }

        cfg = {
            env: {
                API_ADDRESS: env.API_ADDRESS,
                API_PORT: env.API_PORT,
                DB_HOST: env.DB_HOST,
                DB_NAME: env.DB_NAME,
                DB_PASS: env.DB_PASS,
                DB_PORT: env.DB_PORT,
                DB_USER: env.DB_USER,
            },
        };
    }

    return cfg;
};

class Env {
    @IsString()
    API_ADDRESS: string;

    @Type(() => Number)
    @IsNumber()
    API_PORT: string;

    @IsString()
    DB_USER: string;

    @IsString()
    DB_NAME: string;

    @IsString()
    DB_HOST: string;

    @Type(() => Number)
    @IsNumber()
    DB_PORT: string;

    @IsString()
    DB_PASS: string;
}

export class Config {
    env: Env;
}
