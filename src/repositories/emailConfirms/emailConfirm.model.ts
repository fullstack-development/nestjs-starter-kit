import { HttpStatus } from '@nestjs/common';
import { BaseError, makeError } from '../../model/errors.model';

export type CannotFindEmailConfirm = BaseError & {
    error: 'cannotFindEmailConfirm';
};
export const cannotFindEmailConfirm = () =>
    makeError<CannotFindEmailConfirm>('cannotFindEmailConfirm', HttpStatus.OK);

export type CannotUpdateEmailConfirm = BaseError & {
    error: 'cannotUpdateEmailConfirm';
};
export const cannotUpdateEmailConfirm = () =>
    makeError<CannotUpdateEmailConfirm>(
        'cannotUpdateEmailConfirm',
        HttpStatus.INTERNAL_SERVER_ERROR,
    );

export type CannotRemoveEmailConfirm = BaseError & {
    error: 'cannotRemoveEmailConfirm';
};
export const cannotRemoveEmailConfirm = () =>
    makeError<CannotRemoveEmailConfirm>(
        'cannotRemoveEmailConfirm',
        HttpStatus.INTERNAL_SERVER_ERROR,
    );
