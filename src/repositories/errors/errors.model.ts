import { HttpStatus } from '@nestjs/common';
import { BaseError, makeError } from '../../model/errors.model';

export type CannotFindError = BaseError & {
    error: 'cannotFindError';
};
export const cannotFindError = () => makeError<CannotFindError>('cannotFindError', HttpStatus.OK);

export type CannotUpdateError = BaseError & {
    error: 'cannotUpdateError';
};
export const cannotUpdateError = () =>
    makeError<CannotUpdateError>('cannotUpdateError', HttpStatus.INTERNAL_SERVER_ERROR);

export type CannotRemoveError = BaseError & {
    error: 'cannotRemoveError';
};
export const cannotRemoveError = () =>
    makeError<CannotRemoveError>('cannotRemoveError', HttpStatus.INTERNAL_SERVER_ERROR);
