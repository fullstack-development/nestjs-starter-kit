import { pick } from 'ramda';

export type GetTokenResult = {
    token: string;
    refreshCookie: string;
};

export type TokenPayload = {
    id: number;
};

export const signInToBody = (data: GetTokenResult) => pick(['token'], data);

export const signInToCookie = (data: GetTokenResult) => ({
    'Set-Cookie': data.refreshCookie,
});

export const refreshToBody = (data: GetTokenResult) => pick(['token'], data);

export const refreshToCookie = (data: GetTokenResult) => ({
    'Set-Cookie': data.refreshCookie,
});

export const confirmEmailToBody = (data: GetTokenResult) => pick(['token'], data);

export const confirmEmailToCookie = (data: GetTokenResult) => ({
    'Set-Cookie': data.refreshCookie,
});
