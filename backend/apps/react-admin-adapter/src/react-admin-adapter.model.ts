import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetQuery {
    @IsOptional()
    @Transform(({ value }) => {
        switch (typeof value) {
            case 'string':
                return JSON.parse(value);
            case 'object':
                return value;
            default:
                return undefined;
        }
    })
    filter?: Record<string, unknown>;

    @IsOptional()
    @Transform(({ value }) => {
        switch (typeof value) {
            case 'string':
                return JSON.parse(value);
            case 'object':
                return value;
            default:
                return undefined;
        }
    })
    range?: [number, number];

    @IsOptional()
    @Transform(({ value }) => {
        switch (typeof value) {
            case 'string':
                return JSON.parse(value);
            case 'object':
                return value;
            default:
                return undefined;
        }
    })
    sort?: [string, string];
}
