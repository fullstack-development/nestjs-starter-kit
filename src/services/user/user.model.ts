import { HttpStatus } from '@nestjs/common';
import { BaseError, makeError } from '../../model/errors.model';

export type UserPayload = {
    email: string;
    password: string;
};

type UserAlreadyExist = BaseError & {
    error: 'userAlreadyExist';
};
export const userAlreadyExist = () =>
    makeError<UserAlreadyExist>('userAlreadyExist', HttpStatus.OK);

type CannotCreateUser = BaseError & {
    error: 'cannotCreateUser';
};
export const cannotCreateUser = (email: string) =>
    makeError<CannotCreateUser>('cannotCreateUser', HttpStatus.INTERNAL_SERVER_ERROR, {
        payload: { email },
    });

type EmailOrPasswordIncorrect = BaseError & {
    error: 'emailOrPasswordIncorrect';
};
export const emailOrPasswordIncorrect = () =>
    makeError<EmailOrPasswordIncorrect>('emailOrPasswordIncorrect', HttpStatus.OK);
