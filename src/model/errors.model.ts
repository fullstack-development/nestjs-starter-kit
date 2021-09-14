import { HttpStatus } from '@nestjs/common';
import * as classValidator from 'class-validator';

export class ValidationError {
    message: string;

    constructor(
        message: string,
        errors: Array<classValidator.ValidationError>,
        actual?: Record<string, unknown>,
    ) {
        this.message = `${message}:\n${errors.reduce(
            (prev, cur) => `${prev}\n${cur.toString()}`,
            '',
        )}${actual ? `\nActual object:\n${JSON.stringify(actual)}` : ''}`;
    }
}

export type BaseErrorExtra = {
    message?: string;
    payload?: unknown;
};

export type BaseError = {
    error: string;
    status: HttpStatus.OK | HttpStatus.INTERNAL_SERVER_ERROR | HttpStatus.BAD_REQUEST;
    extra?: BaseErrorExtra;
    stackTrace?: string;
};

export const makeError = <E extends BaseError>(
    error: E['error'],
    status: E['status'],
    extra?: E['extra'],
) =>
    ({
        error,
        status,
        extra,
        stackTrace: status === HttpStatus.INTERNAL_SERVER_ERROR ? new Error().stack : undefined,
    } as E);
