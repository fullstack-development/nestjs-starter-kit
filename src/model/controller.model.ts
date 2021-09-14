import { HttpStatus } from '@nestjs/common';
import { ErrorsServiceProvider } from '../services/errors/errors.service';
import { BaseError } from './errors.model';
import { ResultFail } from './result.model';

export const processControllerError = async (
    fail: ResultFail<BaseError>,
    errorsService: ErrorsServiceProvider,
) => {
    switch (fail.error.status) {
        case HttpStatus.OK:
            return { code: HttpStatus.OK, body: { status: false, error: fail.error.error } };
        case HttpStatus.BAD_REQUEST:
            return { code: HttpStatus.BAD_REQUEST, body: { error: fail.error.error } };
        case HttpStatus.INTERNAL_SERVER_ERROR:
            const uuid = await errorsService.handleError(fail);
            return { code: HttpStatus.INTERNAL_SERVER_ERROR, body: { uuid } };
    }
};
