import cookieParser from 'cookie-parser';
import { plainToClass } from 'class-transformer';
import { Matches, validate } from 'class-validator';
import { spec } from 'pactum';
import { getResponse } from '../utils/pactum.utils';
import { jwtRegexString } from '../utils/regex.utils';
import { userInput } from '../mocks';

describe('Auth Controller', () => {
    it('should return 400 on invalid body', async () => {
        await signUp.spec().withBody({}).expectStatus(400).toss();
    });
});

const signUpSpec = () => spec().post(`http://localhost:${process.env['PORT']}/auth/sign-up`);
const signUp = {
    spec: signUpSpec,
    send: (data: { email: string; password: string }) =>
        signUpSpec().withBody(data).expectStatus(200).toss(),
};

const signInSpec = () => spec().post(`http://localhost:${process.env['PORT']}/auth/sign-in`);
const signIn = {
    spec: signInSpec,
    send: async (data: { email: string; password: string }): Promise<SignInBody> => {
        const response = getResponse(await signInSpec().withBody(data).expectStatus(200).toss());

        const errors = await validate(plainToClass(SignInBody, response.json));
        expect(errors.length).toEqual(0);

        return { accessToken: response.json.accessToken };
    },
};

const confirmEmailSpec = () =>
    spec().post(`http://localhost:${process.env['PORT']}/auth/confirm-email`);
const confirmEmail = {
    spec: confirmEmailSpec,
    send: async (data: { confirmUuid: string }) => {
        const response = getResponse(
            await confirmEmailSpec().withBody(data).expectStatus(200).toss(),
        );

        return extractAuthData(response);
    },
};

const refreshSpec = () => spec().post(`http://localhost:${process.env['PORT']}/auth/refresh`);
const refresh = {
    spec: refreshSpec,
    send: async (refreshToken: string) => {
        const response = getResponse(
            await refreshSpec()
                .withCookies({
                    Refresh: refreshToken,
                })
                .expectStatus(200)
                .toss(),
        );

        return extractAuthData(response);
    },
};

async function extractAuthData(response: ReturnType<typeof getResponse>) {
    const headersErrors = await validate(plainToClass(ConfirmEmailHeaders, response.headers));
    const bodyErrors = await validate(plainToClass(ConfirmEmailBody, response.json));
    expect(headersErrors.length).toEqual(0);
    expect(bodyErrors.length).toEqual(0);

    const cookie = cookieParser.JSONCookie(response.headers['Set-Cookie']);
    const cookieErrors = await validate(plainToClass(CookieResponse, cookie));
    expect(cookieErrors.length).toEqual(0);
    expect(cookie).not.toEqual(undefined);

    return {
        accessToken: response.json.accessToken,
        refreshToken: (cookie as CookieResponse)['Refresh'],
    };
}

class SignInBody {
    @Matches(new RegExp(`^${jwtRegexString}$`))
    accessToken: string;
}

class ConfirmEmailBody {
    @Matches(new RegExp(`^${jwtRegexString}$`))
    accessToken: string;
}

class ConfirmEmailHeaders {
    @Matches(
        new RegExp(
            `^Refresh=(${jwtRegexString}); HttpOnly; Path=\/; Max-Age=([0-9]+) ([A-za-z]+)$`,
        ),
    )
    'Set-Cookie': string;
}

class CookieResponse {
    @Matches(new RegExp(`^${jwtRegexString}$`))
    'Refresh': string;
}

export { signUp, signIn, confirmEmail, refresh };
