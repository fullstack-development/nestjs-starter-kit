import { PrismaClient } from '@prisma/client';
import { isJWT } from 'class-validator';
import { v4 } from 'uuid';
import { confirmEmail, refresh, signIn, signUp } from './endpoints/auth.controller.endpoints';

describe('Auth Controller', () => {
    let prisma: PrismaClient;

    beforeAll(async () => {
        prisma = new PrismaClient();
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/auth/sign-up', () => {
        it('should return 400 on invalid body', async () => {
            await signUp.spec().withBody({}).expectStatus(400).toss();
        });

        it('should return 400 on invalid email', async () => {
            await signUp
                .spec()
                .withBody({ password: '12345678', email: 'invalid' })
                .expectStatus(400)
                .toss();
        });

        it('should success sign up user', async () => {
            await signUp.send({ email: 'test@example.com', password: '12345678' });

            expect(
                (await prisma.user.findFirst({ where: { email: 'test@example.com' } }))
                    ?.emailConfirmed,
            ).toBeFalsy();
        });

        it('should return error if user already exist', async () => {
            await signUp
                .spec()
                .withBody({ email: 'test@example.com', password: '12345678' })
                .expectStatus(200)
                .expectJsonLike({ data: { error: 'userAlreadyExist' } });
        });
    });

    describe('POST /api/auth/confirm-email', () => {
        it('should return 400 on invalid body', async () => {
            await confirmEmail.spec().withBody({}).expectStatus(400).toss();
        });

        it('should return 400 on invalid uuid', async () => {
            await confirmEmail.spec().withBody({ confirmUuid: 'invalid' }).expectStatus(400).toss();
        });

        it('should return error if email confirm not found', async () => {
            await confirmEmail
                .spec()
                .withBody({ confirmUuid: v4() })
                .expectStatus(200)
                .expectJsonLike({ data: { error: 'cannotFindEmailConfirm' } });
        });

        it('should success confirm email', async () => {
            const user = await prisma.user.findFirst({
                where: { email: 'test@example.com' },
                include: { emailConfirm: true },
            });

            expect(
                (await prisma.user.findFirst({ where: { email: 'test@example.com' } }))
                    ?.emailConfirmed,
            ).toBeFalsy();

            await confirmEmail.send(user?.emailConfirm?.confirmUuid as string);

            expect(
                (await prisma.user.findFirst({ where: { email: 'test@example.com' } }))
                    ?.emailConfirmed,
            ).toBeTruthy();
        });

        it('should return error if user already confirmed email', async () => {
            const user = await prisma.user.findFirst({
                where: { email: 'test@example.com' },
                include: { emailConfirm: true },
            });

            await confirmEmail
                .spec()
                .withBody({ confirmUuid: user?.emailConfirm?.confirmUuid })
                .expectStatus(200)
                .expectJsonLike({ data: { error: 'emailAlreadyConfirmed' } });
        });
    });

    describe('POST /api/auth/sign-in', () => {
        it('should return 400 on invalid body', async () => {
            await signIn.spec().withBody({}).expectStatus(400).toss();
            await signIn.spec().withBody({ email: 'test@example.com' }).expectStatus(400).toss();
            await signIn
                .spec()
                .withBody({ email: 'invalid', password: '12345678' })
                .expectStatus(400)
                .toss();
        });

        it('should return error if user not confirm email', async () => {
            await signUp.send({ email: 'test1@example.com', password: '12345678' });

            await signIn
                .spec()
                .withBody({ email: 'test1@example.com', password: '12345678' })
                .expectStatus(200)
                .expectJsonLike({ data: { error: 'emailNotConfirmed' } });
        });

        it('should return error if email or password incorrect', async () => {
            await signIn
                .spec()
                .withBody({ email: 'test@example.com', password: '123456789' })
                .expectStatus(200)
                .expectJsonLike({ data: { error: 'emailOrPasswordIncorrect' } });
            await signIn
                .spec()
                .withBody({ email: 'test2@example.com', password: '12345678' })
                .expectStatus(200)
                .expectJsonLike({ data: { error: 'emailOrPasswordIncorrect' } });
        });

        it('should success return tokens', async () => {
            await signIn.send({ email: 'test@example.com', password: '12345678' });
        });
    });

    describe('GET /api/auth/refresh', () => {
        it('should return 401', async () => {
            await refresh.spec().expectStatus(401).toss();
        });

        it('should return new access token and refresh token in cookie', async () => {
            const tokens = await signIn.send({ email: 'test@example.com', password: '12345678' });

            const result = await refresh.send(tokens.refreshToken);
            expect(isJWT(result.accessToken)).toEqual(true);
            expect(isJWT(result.refreshToken)).toEqual(true);
        });
    });
});
