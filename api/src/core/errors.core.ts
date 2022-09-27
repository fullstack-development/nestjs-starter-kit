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

export class BaseError<E> {
    error: E;
    userErrorOnly?: boolean;
    message?: string;
    payload?: Record<string, unknown>;
    stackTrace?: string;

    constructor(
        error: E,
        options?: {
            userErrorOnly?: boolean;
            payload?: Record<string, unknown>;
            message?: string;
        },
    ) {
        this.error = error;
        this.payload = options?.payload;
        this.message = options?.message;
        this.userErrorOnly = options?.userErrorOnly;
        if (Boolean(options?.userErrorOnly)) {
            this.stackTrace = new Error().stack;
        }
    }
}

export function isError<T, E>(value: T | BaseError<E>): value is BaseError<E> {
    return value instanceof BaseError;
}

export function isBaseErrorString(be: BaseError<unknown>): be is BaseError<string> {
    return typeof be.error === 'string';
}
