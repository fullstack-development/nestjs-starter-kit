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

export class BaseError {
    stackTrace?: string;

    constructor(
        public error: string,
        public status: HttpStatus.OK | HttpStatus.INTERNAL_SERVER_ERROR | HttpStatus.BAD_REQUEST,
        public extra?: BaseErrorExtra,
    ) {
        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.stackTrace = new Error().stack;
        }
    }
}
