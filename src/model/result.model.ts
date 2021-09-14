import { HttpStatus } from '@nestjs/common';
import { BaseError, BaseErrorExtra } from './errors.model';

export type IResultCommonSuccess = {
    success: true;
};

export type IResultSuccess<T> = {
    success: true;
    data: T;
};

export type IResultFail<E extends BaseError> = {
    success: false;
    error: E;
    makeResponse: () => {
        success: false;
        error: E['error'];
        message?: BaseErrorExtra['message'];
        payload?: BaseErrorExtra['payload'];
    };
};

export type IResult<T, E extends BaseError> =
    | IResultCommonSuccess
    | IResultSuccess<T>
    | IResultFail<E>;

export const resultFail = <E extends BaseError>(error: E): IResultFail<E> => ({
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

export function resultSuccess(): IResultCommonSuccess;
export function resultSuccess<T>(data: T): IResultSuccess<T>;
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
