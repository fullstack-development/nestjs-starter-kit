import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { isObject } from 'class-validator';
import { v4 } from 'uuid';
import { Prisma } from '../../repository/src';

let uuidIndex = 0;
export function uuid() {
    return process.env.TEST === 'true' ? `uuid-${++uuidIndex}` : v4();
}

let dateIndex = 0;
function now() {
    return process.env.TEST === 'true' ? new Date(++dateIndex) : new Date();
}

function from(value: number | string | Date) {
    return new Date(value);
}

export const date = {
    now,
    from,
};

export const sleep = (ms: number) => new Promise((res) => setTimeout(() => res(true), ms));

export const ConvertToDecimal = () =>
    applyDecorators(
        Transform(({ value }: { value: string | number }) => {
            if (isObject(value)) {
                return value;
            }
            return new Prisma.Decimal(value);
        }),
    );

export * from './crypt.utils';
export * from './mapped-types';
export * from './ramda.utils';
export * from './typescript.utils';
export * from './validation.utils';
