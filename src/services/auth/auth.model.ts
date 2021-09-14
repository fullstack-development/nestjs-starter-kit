import { HttpStatus } from '@nestjs/common';
import { BaseError, makeError } from '../../model/errors.model';
import { UserEntity } from '../../repositories/users/user.entity';

export type TokenPayload = {
    email: string;
};

export type UserPayload = {
    email: string;
    password: string;
};

type EmailNotConfirmed = BaseError & {
    error: 'emailNotConfirmed';
};
export const emailNotConfirmed = () =>
    makeError<EmailNotConfirmed>('emailNotConfirmed', HttpStatus.OK);

type ConfirmationNotFound = BaseError & {
    error: 'confirmationNotFound';
};
export const confirmationNotFound = () =>
    makeError<ConfirmationNotFound>('confirmationNotFound', HttpStatus.OK);

type EmailAlreadyConfirmed = BaseError & {
    error: 'emailAlreadyConfirmed';
};
export const emailAlreadyConfirmed = () =>
    makeError<EmailAlreadyConfirmed>('emailAlreadyConfirmed', HttpStatus.OK);

type CannotCreateEmailConfirmation = BaseError & {
    error: 'cannotCreateEmailConfirmation';
};
export const cannotCreateEmailConfirmation = (
    payload: Pick<UserEntity, 'id'> & { createdConfirmId: number },
) =>
    makeError<CannotCreateEmailConfirmation>(
        'cannotCreateEmailConfirmation',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { payload },
    );

type CannotSendEmailConfirmation = BaseError & {
    error: 'cannotSendEmailConfirmation';
};
export const cannotSendEmailConfirmation = (payload: { sourceError: BaseError }) =>
    makeError<CannotSendEmailConfirmation>(
        'cannotSendEmailConfirmation',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { payload },
    );
