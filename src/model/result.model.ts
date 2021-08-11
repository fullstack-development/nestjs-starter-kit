import { HttpStatus } from '@nestjs/common';
import { BaseError, BaseErrorExtra } from './errors.model';

export type ResultCommonSuccess = {
    success: true;
};

export type ResultSuccess<T> = {
    success: true;
    data: T;
};

export type ResultFail<E extends BaseError> = {
    success: false;
    error: E;
    makeResponse: () => {
        success: false;
        error: E['error'];
        message?: BaseErrorExtra['message'];
        payload?: BaseErrorExtra['payload'];
    };
};

export const resultFail = <E extends BaseError>(error: E): ResultFail<E> => ({
    success: false,
    error,
    makeResponse: () => ({
        success: false,
        error: error.error,
        message: error.extra?.message,
        stackTrace: error.stackTrace,
        payload:
            error.status === HttpStatus.INTERNAL_SERVER_ERROR ? undefined : error.extra?.payload,
    }),
});

export function resultSuccess(): ResultCommonSuccess;
export function resultSuccess<T>(data: T): ResultSuccess<T>;
export function resultSuccess(data?: unknown) {
    if (data) {
        return {
            success: true,
            data,
        };
    } else {
        return { success: true };
    }
}
