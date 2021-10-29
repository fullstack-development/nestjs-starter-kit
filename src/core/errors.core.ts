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

export class BasicError<E> {
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

export function isError<T, E>(value: T | BasicError<E>): value is BasicError<E> {
    return value instanceof BasicError;
}
