import { http } from '../../../../http';
import { SignInPayload, SignInResponse } from './types';

export const signIn = (payload: SignInPayload) => {
    return http.post<SignInResponse>('auth/sign-in', payload);
};

export const signOut = () => {
    return http.post<void>('auth/sign-out', {});
};
