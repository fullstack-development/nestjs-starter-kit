import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { isError } from '@lib/core';
import { DatabaseProvider, EmailConfirm } from '@lib/repository';
import { DatabaseRepositoriesMock, mockDatabaseRepositories } from '@lib/testing';
import { Test } from '@nestjs/testing';
import { ConfigProvider } from '../../../core/config/config.core';
import { ConfigServiceFake } from '../../../__mocks__/ConfigServiceFake';
import { getConfirmEmailStub } from '../../../__mocks__/confirmEmail.stub';
import { getUserStub } from '../../../__mocks__/user.stub';
import { MailServiceProvider } from '../../mail/mail.service';
import { TokenServiceProvider } from '../../token/token.service';
import { UserServiceProvider } from '../../user/user.service';
import { AuthServiceProvider } from '../auth.service';
import {
    CannotFindEmailConfirm,
    CannotFindUser,
    EmailOrPasswordIncorrect,
    UserAlreadyExist,
} from './../../user/user.model';

describe('AuthService', () => {
    let authService: AuthServiceProvider;
    let configService: ConfigServiceFake;
    let userService: DeepMocked<UserServiceProvider>;
    let tokenService: DeepMocked<TokenServiceProvider>;

    let db: DatabaseRepositoriesMock;

    let user: ReturnType<typeof getUserStub>;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthServiceProvider,
                { provide: ConfigProvider, useClass: ConfigServiceFake },
                {
                    provide: DatabaseProvider,
                    useValue: mockDatabaseRepositories(),
                },
                {
                    provide: UserServiceProvider,
                    useValue: createMock<UserServiceProvider>(),
                },
                {
                    provide: MailServiceProvider,
                    useValue: createMock<MailServiceProvider>(),
                },
                {
                    provide: TokenServiceProvider,
                    useValue: createMock<TokenServiceProvider>(),
                },
            ],
        }).compile();

        authService = module.get(AuthServiceProvider);

        configService = module.get(ConfigProvider);
        db = module.get(DatabaseProvider);
        userService = module.get(UserServiceProvider);
        tokenService = module.get(TokenServiceProvider);

        user = getUserStub();
    });

    it('should be defined service and all deps', () => {
        expect(authService).toBeDefined();
        expect(configService).toBeDefined();
        expect(db).toBeDefined();
        expect(userService).toBeDefined();
    });

    describe('sign-up', () => {
        let confirmMail: EmailConfirm;

        beforeEach(() => {
            confirmMail = getConfirmEmailStub();
        });

        it('should correct sign-up', async () => {
            userService.createUser.mockResolvedValue(user);
            userService.findUser.mockResolvedValue(user);
            db.emailConfirm.create.mockResolvedValue(confirmMail);
            db.emailConfirm.findFirst.mockResolvedValue(confirmMail);

            const createdResult = await authService.signUp({
                email: 'test@example.com',
                password: '12345678',
            });

            expect(isError(createdResult)).toBeFalsy();
        });

        it('should return error if user already exist', async () => {
            userService.createUser.mockResolvedValue(new UserAlreadyExist());

            const createdResult = await authService.signUp({
                email: 'test@example.com',
                password: '12345678',
            });

            expect(isError(createdResult)).toBeTruthy();
            expect(createdResult).toEqual(expect.objectContaining({ error: 'userAlreadyExist' }));
        });

        it('should return error if user email is already confirmed', async () => {
            userService.createUser.mockResolvedValue(user);
            userService.findUser.mockResolvedValue({ ...user, emailConfirmed: true });

            const createdResult = await authService.signUp({
                email: 'test@example.com',
                password: '12345678',
            });

            expect(isError(createdResult)).toBeTruthy();
            expect(createdResult).toEqual(
                expect.objectContaining({ error: 'cannotSendEmailConfirmation' }),
            );
        });
    });

    describe('sign-in', () => {
        it('should success sign-in with correct login and password', async () => {
            const refreshToken = {
                id: 0,
                hash: 'e1eae9e373ba62a80cdbd4422fc002553447aeb38fdb8dbf511a52d3e8c5e417',
                userId: 0,
                user,
            };
            userService.findVerifiedUser.mockResolvedValue({ ...user, emailConfirmed: true });
            userService.findUser.mockResolvedValueOnce(user);
            db.refreshToken.create.mockResolvedValue(refreshToken);
            tokenService.generate.mockResolvedValueOnce({
                accessToken: '1',
                refreshCookie: '2',
                refreshToken: '3',
            });

            const signInResult = await authService.signIn({
                email: user.email,
                password: '12345678',
            });

            expect(isError(signInResult)).toBeFalsy();
            expect(signInResult).toEqual(
                expect.objectContaining({
                    accessToken: expect.any(String),
                    refreshCookie: expect.any(String),
                }),
            );
        });

        it('should return error with incorrect login or password', async () => {
            userService.findVerifiedUser.mockResolvedValue(new EmailOrPasswordIncorrect());

            const signInResult = await authService.signIn({
                email: user.email,
                password: '12345678',
            });

            expect(isError(signInResult)).toBeTruthy();
            expect(signInResult).toEqual(
                expect.objectContaining({
                    error: 'emailOrPasswordIncorrect',
                }),
            );
        });

        it('should return error if email not confirmed', async () => {
            userService.findVerifiedUser.mockResolvedValue(user);

            const signInResult = await authService.signIn({
                email: user.email,
                password: '12345678',
            });

            expect(isError(signInResult)).toBeTruthy();
            expect(signInResult).toEqual(
                expect.objectContaining({
                    error: 'emailNotConfirmed',
                }),
            );
        });
    });

    describe('confirm email', () => {
        let confirmMail: EmailConfirm;

        beforeEach(() => {
            confirmMail = getConfirmEmailStub();
        });

        it('should confirm email', async () => {
            const refreshToken = {
                id: 0,
                hash: 'e1eae9e373ba62a80cdbd4422fc002553447aeb38fdb8dbf511a52d3e8c5e417',
                userId: 0,
                user,
            };
            db.emailConfirm.findFirst.mockResolvedValue(confirmMail);
            userService.findUser.mockResolvedValue(user);
            userService.confirmEmail.mockResolvedValue(undefined);
            userService.findUser.mockResolvedValueOnce(user);
            db.refreshToken.create.mockResolvedValue(refreshToken);
            tokenService.generate.mockResolvedValueOnce({
                accessToken: '1',
                refreshCookie: '2',
                refreshToken: '3',
            });

            const confirmResult = await authService.confirmEmail('1');

            expect(isError(confirmResult)).toBeFalsy();
            expect(confirmResult).toEqual(
                expect.objectContaining({
                    accessToken: expect.any(String),
                    refreshCookie: expect.any(String),
                }),
            );
        });

        it('should return error if email already confirmed', async () => {
            db.emailConfirm.findFirst.mockResolvedValue(confirmMail);
            userService.findUser.mockResolvedValue({ ...user, emailConfirmed: true });

            const confirmResult = await authService.confirmEmail('1');

            expect(isError(confirmResult)).toBeTruthy();
            expect(confirmResult).toEqual(
                expect.objectContaining({
                    error: 'emailAlreadyConfirmed',
                }),
            );
        });

        it('should return error if confirmation not found', async () => {
            db.emailConfirm.findFirst.mockResolvedValue(null);

            const confirmResult = await authService.confirmEmail('1');

            expect(isError(confirmResult)).toBeTruthy();
            expect(confirmResult).toBeInstanceOf(CannotFindEmailConfirm);
        });
    });

    describe('signOut', () => {
        it('should delete refresh token from database on signOut', async () => {
            userService.findUser.mockResolvedValueOnce(user);

            await authService.signOut(user.email);

            expect(userService.findUser).toBeCalledTimes(1);
            expect(userService.findUser).toBeCalledWith({ email: user.email });
            expect(db.refreshToken.delete).toBeCalledTimes(1);
            expect(db.refreshToken.delete).toBeCalledWith({
                where: { userId: user.id },
            });
        });

        it('should not call delete on error when findUser function is called', async () => {
            userService.findUser.mockResolvedValueOnce(new CannotFindUser());

            await authService.signOut(user.email);

            expect(userService.findUser).toBeCalledTimes(1);
            expect(userService.findUser).toBeCalledWith({ email: user.email });
            expect(db.refreshToken.delete).toBeCalledTimes(0);
        });
    });
});
