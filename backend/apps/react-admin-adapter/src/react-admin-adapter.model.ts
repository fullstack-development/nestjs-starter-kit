import { Transform, TransformFnParams } from 'class-transformer';
import { IsDefined, IsOptional } from 'class-validator';

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
    @IsDefined()
    @Transform(transformQueryObject)
    range: [number, number];

    @IsOptional()
    @Transform(transformQueryObject)
    filter?: Record<string, unknown>;

    @IsOptional()
    @Transform(transformQueryObject)
    sort?: [string, string];
}
