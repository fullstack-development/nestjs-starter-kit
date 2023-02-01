import { plainToClass } from 'class-transformer';
import { IsJWT, isJWT, validate } from 'class-validator';
import * as cookieParser from 'cookie';
import Spec from 'pactum/src/models/Spec';
import { getSpec, postSpec } from '../../../pactum';
import { IsTrue } from '../../../utils/validation.utils';

type SignInput = {
    email: string;
    password: string;
};

const signIn = postSpec.api<SignInput, { accessToken: string; refreshToken: string }>(
    'auth/sign-in',
    (spec: Spec) => async (data: SignInput) => {
        const response = await spec
            .withBody({
                email: data.email,
                password: data.password,
            })
            .expectStatus(200)
            .toss();

        return extractAuthData(response);
    },
);

const signUp = postSpec.api<SignInput, true>(
    'auth/sign-up',
    (spec: Spec) => async (data: SignInput) => {
        const response = await spec
            .withBody({
                email: data.email,
                password: data.password,
            })
            .expectStatus(200)
            .toss();

        const body = plainToClass(SignUpResponse, response.json);

        const errors = await validate(body);
        expect(errors.length).toEqual(0);

        return body.success;
    },
);

const refresh = getSpec.api<string, { accessToken: string; refreshToken: string }>(
    'auth/refresh',
    (spec) => async (refreshToken) => {
        const response = await spec
            .withCookies({
                Refresh: refreshToken,
            })
            .expectStatus(200)
            .toss();

        return extractAuthData(response);
    },
);

const confirmEmail = postSpec.api<string, { accessToken: string; refreshToken: string }>(
    'auth/confirm-email',
    (spec) => async (confirmUuid) => {
        const response = await spec.withBody({ confirmUuid }).expectStatus(200).toss();

        return extractAuthData(response);
    },
);

async function extractAuthData(response: any) {
    const refreshToken = (cookieParser.parse(response.headers['set-cookie'][0]) || {})['Refresh'];
    expect(isJWT(refreshToken)).toEqual(true);

    const bodyErrors = await validate(plainToClass(AuthBody, response.json));
    expect(bodyErrors.length).toEqual(0);

    return {
        accessToken: response.json.data as string,
        refreshToken: refreshToken,
    };
}

class AuthBody {
    @IsJWT()
    data: string;
}

class SignUpResponse {
    @IsTrue()
    success: true;
}

export { signIn, refresh, confirmEmail, signUp };
