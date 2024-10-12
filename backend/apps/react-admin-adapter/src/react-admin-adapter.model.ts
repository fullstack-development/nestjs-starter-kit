import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { In } from 'typeorm';

const transformQueryObject = ({ value }: TransformFnParams) => {
    switch (typeof value) {
        case 'string':
            return JSON.parse(value);
        case 'object':
            return value;
        default:
            return undefined;
    }
};

export class GetQuery {
    @IsOptional()
    @Transform(transformQueryObject)
    range?: [number, number];

    @IsOptional()
    @Transform(transformQueryObject)
    filter?: Record<string, unknown>;

    @IsOptional()
    @Transform(transformQueryObject)
    sort?: [string, string];
}

const isRecord = (o: unknown): o is Record<string, unknown> =>
    o !== null && o !== undefined && typeof o === 'object' && o && typeof o !== 'string' && !Array.isArray(o);

export const parseQueryFilter = (queryFilter: Object) => {
    if (!isRecord(queryFilter)) {
        return undefined;
    }

    const where: Record<string, any> = {};
    for (const key of Object.keys(queryFilter)) {
        const filter = queryFilter[key];
        if (Array.isArray(filter)) {
            where[key] = In(filter);
        }
    }

    return where;
};
