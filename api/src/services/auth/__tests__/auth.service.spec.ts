import { UserAlreadyExist, EmailOrPasswordIncorrect } from './../../user/user.model';
import { EmailConfirmsRepositoryProvider } from './../../../repositories/emailConfirms/emailConfirms.repository';
import { MockRepository, mockRepository } from './../../../utils/tests.utils';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ConfigServiceFake } from '../../../__mocks__/ConfigServiceFake';
import { Test } from '@nestjs/testing';
import { AuthServiceProvider } from '../auth.service';
import { getUserStub } from '../../../__mocks__/user.stub';
import { isError } from '../../../core/errors.core';
import { ConfigServiceProvider } from '../../config/config.service';
import { UsersRepositoryProvider } from '../../../repositories/users/users.repository';
import { RefreshTokensRepositoryProvider } from '../../../repositories/refreshTokens/refreshTokens.repository';
import { MailServiceProvider } from '../../mail/mail.service';
import { UserServiceProvider } from '../../user/user.service';
import {
    CannotFindEmailConfirm,
    CannotFindUser,
} from '../../../repositories/repositoryErrors.model';
import { date } from '../../../utils';
import { TokenServiceProvider } from '../../token/token.service';
import { EmailConfirm } from '@prisma/client';
import { getConfirmEmailStub } from '../../../__mocks__/confirmEmail.stub';

describe('AuthService', () => {
    let authService: AuthServiceProvider;
    let configService: ConfigServiceFake;
    let userService: DeepMocked<UserServiceProvider>;
    let tokenService: DeepMocked<TokenServiceProvider>;

    let usersRepository: MockRepository<UsersRepositoryProvider>;
    let refreshTokensRepository: MockRepository<RefreshTokensRepositoryProvider>;
    let emailConfirmsRepository: MockRepository<EmailConfirmsRepositoryProvider>;

    let user: ReturnType<typeof getUserStub>;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthServiceProvider,
                { provide: ConfigServiceProvider, useClass: ConfigServiceFake },
                {
                    provide: UserServiceProvider,
                    useValue: createMock<UserServiceProvider>(),
                },
                {
                    provide: MailServiceProvider,
                    useValue: createMock<MailServiceProvider>(),
                },
                {
                    provide: RefreshTokensRepositoryProvider,
                    useValue: mockRepository<RefreshTokensRepositoryProvider>(),
                },
                {
                    provide: UsersRepositoryProvider,
                    useValue: mockRepository<UsersRepositoryProvider>(),
                },
                {
                    provide: TokenServiceProvider,
                    useValue: createMock<TokenServiceProvider>(),
                },
                {
                    provide: EmailConfirmsRepositoryProvider,
                    useValue: mockRepository<EmailConfirmsRepositoryProvider>(),
                },
            ],
        }).compile();

        authService = module.get(AuthServiceProvider);
        configService = module.get(ConfigServiceProvider);
        tokenService = module.get(TokenServiceProvider);
        userService = module.get(UserServiceProvider);

        usersRepository = module.get(UsersRepositoryProvider);
        refreshTokensRepository = module.get(RefreshTokensRepositoryProvider);
        emailConfirmsRepository = module.get(EmailConfirmsRepositoryProvider);

        user = getUserStub();
    });

    it('should be defined service and all deps', () => {
        expect(authService).toBeDefined();
        expect(configService).toBeDefined();
        expect(usersRepository).toBeDefined();
        expect(refreshTokensRepository).toBeDefined();
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
            emailConfirmsRepository.Dao.create.mockResolvedValue(confirmMail);
            emailConfirmsRepository.Dao.findFirst.mockResolvedValue(confirmMail);

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
            refreshTokensRepository.Dao.create.mockResolvedValue(refreshToken);
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
            emailConfirmsRepository.Dao.findFirst.mockResolvedValue(confirmMail);
            userService.findUser.mockResolvedValue(user);
            userService.confirmEmail.mockResolvedValue(undefined);
            userService.findUser.mockResolvedValueOnce(user);
            refreshTokensRepository.Dao.create.mockResolvedValue(refreshToken);
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
            emailConfirmsRepository.Dao.findFirst.mockResolvedValue(confirmMail);
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
            emailConfirmsRepository.Dao.findFirst.mockResolvedValue(null);

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
            expect(refreshTokensRepository.Dao.delete).toBeCalledTimes(1);
            expect(refreshTokensRepository.Dao.delete).toBeCalledWith({
                where: { userId: user.id },
            });
        });

        it('should not call delete on error when findUser function is called', async () => {
            userService.findUser.mockResolvedValueOnce(new CannotFindUser());

            await authService.signOut(user.email);

            expect(userService.findUser).toBeCalledTimes(1);
            expect(userService.findUser).toBeCalledWith({ email: user.email });
            expect(refreshTokensRepository.Dao.delete).toBeCalledTimes(0);
        });
    });
});
