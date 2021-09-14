import { HttpStatus } from '@nestjs/common';
import { BaseError, makeError } from '../../model/errors.model';

export type CannotFindUser = BaseError & {
    error: 'cannotFindUser';
};
export const cannotFindUser = () => makeError<CannotFindUser>('cannotFindUser', HttpStatus.OK);

export type CannotUpdateUser = BaseError & {
    error: 'cannotUpdateUser';
};
export const cannotUpdateUser = () =>
    makeError<CannotUpdateUser>('cannotUpdateUser', HttpStatus.INTERNAL_SERVER_ERROR);

export type CannotRemoveUser = BaseError & {
    error: 'cannotRemoveUser';
};
export const cannotRemoveUser = () =>
    makeError<CannotRemoveUser>('cannotRemoveUser', HttpStatus.INTERNAL_SERVER_ERROR);
