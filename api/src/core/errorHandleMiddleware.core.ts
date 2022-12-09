import { Injectable, Module } from '@nestjs/common';
import { BaseError } from './errors.core';

export interface IErrorHandler {
    handleError: (error: BaseError<string> | Error | unknown) => Promise<{ errorUniqId: string }>;
}

@Injectable()
export class ErrorHandleMiddlewareProvider {
    constructor(private handler: IErrorHandler) {}

    public async handleError(error: BaseError<string> | Error | unknown) {
        return this.handler.handleError(error);
    }
}

@Module({
    providers: [ErrorHandleMiddlewareProvider],
    exports: [ErrorHandleMiddlewareProvider],
})
export class ErrorHandleMiddlewareCore {}
