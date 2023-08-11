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

type ErrorKind = 400 | 404 | 409 | 422 | 500;

type ErrorOptions = {
    payload?: Record<string, unknown>;
    message?: string;
};

export class BaseError<E> {
    error: E;
    kind: ErrorKind;
    saveErrorToDatabase: boolean;
    message?: string;
    payload?: Record<string, unknown>;
    stackTrace?: string;

    constructor(error: E, kind: ErrorKind, options?: ErrorOptions) {
        this.error = error;
        this.kind = kind;
        this.payload = options?.payload;
        this.message = options?.message;
        this.saveErrorToDatabase = kind === 500;
        if (Boolean(this.saveErrorToDatabase)) {
            this.stackTrace = new Error().stack;
        }
    }
}

export class NotFoundError extends BaseError<'Not Found'> {
    constructor(options?: ErrorOptions) {
        super('Not Found', HttpStatus.NOT_FOUND, options);
    }
}

export class BadRequestError extends BaseError<'Bad Request'> {
    constructor(options?: ErrorOptions) {
        super('Bad Request', HttpStatus.BAD_REQUEST, options);
    }
}

export class ConflictError<E> extends BaseError<E> {
    constructor(error: E, options?: ErrorOptions) {
        super(error, HttpStatus.CONFLICT, options);
    }
}

export class UnprocessableEntityError<E> extends BaseError<E> {
    constructor(error: E, options?: ErrorOptions) {
        super(error, HttpStatus.UNPROCESSABLE_ENTITY, options);
    }
}

export class InternalServerError<E> extends BaseError<E> {
    constructor(error: E, options?: ErrorOptions) {
        super(error, HttpStatus.INTERNAL_SERVER_ERROR, options);
    }
}

export function isError<T, E, BE extends BaseError<E>>(value: T | BE): value is BE {
    return value instanceof BaseError;
}

export function isBaseErrorString(be: BaseError<unknown>): be is BaseError<string> {
    return typeof be.error === 'string';
}
