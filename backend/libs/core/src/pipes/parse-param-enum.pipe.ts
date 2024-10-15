import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isEnum } from 'class-validator';

@Injectable()
export class ParseParamEnumPipe<T> implements PipeTransform<T> {
    constructor(private readonly enumObj: object) {}

    async transform(value: T) {
        if (!isEnum(value, this.enumObj)) {
            throw new BadRequestException(
                `ParseParamEnumPipe validation failed. Actual: ${value}; Enum: ${this.enumObj}`,
            );
        }
        return value;
    }
}
