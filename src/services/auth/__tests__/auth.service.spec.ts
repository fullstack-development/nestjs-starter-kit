import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BaseError } from '../../../core/errors.core';
import { ConfigServiceFake } from '../../../__mocks__/ConfigServiceFake';
import { Test } from '@nestjs/testing';
import { AuthServiceProvider } from '../auth.service';
import { getUserStub } from '../../../__mocks__/user.stub';
import { isError } from '../../../core/errors.core';
import { getConfirmEmailStub } from '../../../__mocks__/confirmEmail.stub';
import { ConfigServiceProvider } from '../../config/config.service';
import { UsersRepositoryProvider } from '../../../repositories/users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { EmailConfirmsRepositoryProvider } from '../../../repositories/emailConfirms/emailConfirms.repository';
import { RefreshTokensRepositoryProvider } from '../../../repositories/refreshTokens/refreshTokens.repository';
import { MailServiceProvider } from '../../mail/mail.service';
import { UserServiceProvider } from '../../user/user.service';
import { EmailConfirm } from '@prisma/client';
import { sha256 } from '../../../utils/crypt.utils';
import {
    CannotFindEmailConfirm,
    CannotFindUser,
} from '../../../repositories/repositoryErrors.model';

describe('AuthService', () => {
    let authService: AuthServiceProvider;
    let configService: ConfigServiceFake;
    let jwtService: DeepMocked<JwtService>;
    let userService: DeepMocked<UserServiceProvider>;
    let mailService: DeepMocked<MailServiceProvider>;

    let usersRepository: { Dao: DeepMocked<UsersRepositoryProvider['Dao']> };
    let emailConfirmsRepository: { Dao: DeepMocked<EmailConfirmsRepositoryProvider['Dao']> };
    let refreshTokensRepository: { Dao: DeepMocked<RefreshTokensRepositoryProvider['Dao']> };

    let user: ReturnType<typeof getUserStub>;

    beforeEach(async () => {
        const usersDaoMock = createMock<UsersRepositoryProvider['Dao']>();
        const emailConfirmsDaoMock =
            createMock<DeepMocked<EmailConfirmsRepositoryProvider['Dao']>>();
        const refreshTokensDaoMock =
            createMock<DeepMocked<RefreshTokensRepositoryProvider['Dao']>>();
        const module = await Test.createTestingModule({
            providers: [
                AuthServiceProvider,
                { provide: ConfigServiceProvider, useClass: ConfigServiceFake },
                {
                    provide: JwtService,
                    useValue: createMock<JwtService>(),
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
                    provide: RefreshTokensRepositoryProvider,
                    useValue: {
                        get Dao() {
                            return refreshTokensDaoMock;
                        },
                    },
                },
                {
                    provide: UsersRepositoryProvider,
                    useValue: {
                        get Dao() {
                            return usersDaoMock;
                        },
                    },
                },
                {
                    provide: EmailConfirmsRepositoryProvider,
                    useValue: {
                        get Dao() {
                            return emailConfirmsDaoMock;
                        },
                    },
                },
            ],
        }).compile();

        authService = module.get(AuthServiceProvider);
        configService = module.get(ConfigServiceProvider);
        usersRepository = module.get(UsersRepositoryProvider);
        emailConfirmsRepository = module.get(EmailConfirmsRepositoryProvider);
        jwtService = module.get(JwtService);
        refreshTokensRepository = module.get(RefreshTokensRepositoryProvider);
        userService = module.get(UserServiceProvider);
        mailService = module.get(MailServiceProvider);
        user = getUserStub();
    });

    it('should be defined service and all deps', () => {
        expect(authService).toBeDefined();
        expect(configService).toBeDefined();
        expect(usersRepository).toBeDefined();
        expect(emailConfirmsRepository).toBeDefined();
        expect(jwtService).toBeDefined();
        expect(refreshTokensRepository).toBeDefined();
        expect(userService).toBeDefined();
        expect(mailService).toBeDefined();
    });

    describe('generate access and refresh tokens', () => {
        it('should success generate token for new user', async () => {
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            userService.findUser.mockResolvedValueOnce(user);
            refreshTokensRepository.Dao.create.mockResolvedValue({ userId: 0, id: 0, hash: '' });

            const generatedResult = await authService.generateTokens(user.id, user.email);

            expect(isError(generatedResult)).toBeFalsy();
            expect(generatedResult).toEqual(
                expect.objectContaining({
                    accessToken: 'accessToken',
                    refreshToken: 'refreshToken',
                }),
            );
            expect(refreshTokensRepository.Dao.create).toBeCalledTimes(1);
            expect(refreshTokensRepository.Dao.create).toBeCalledWith({
                data: {
                    hash: sha256('refreshToken'),
                    userId: 0,
                },
            });
        });

        it('should success update token for user with old refresh token', async () => {
            const refreshToken = {
                id: 0,
                hash: 'e1eae9e373ba62a80cdbd4422fc002553447aeb38fdb8dbf511a52d3e8c5e417',
                userId: 0,
                user,
            };
            const userWithRefreshToken = {
                ...getUserStub(),
                refreshToken,
            };
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            userService.findUser.mockResolvedValueOnce(userWithRefreshToken);
            refreshTokensRepository.Dao.update.mockResolvedValue(refreshToken);

            const generatedResult = await authService.generateTokens(user.id, user.email);

            expect(isError(generatedResult)).toBeFalsy();
            expect(generatedResult).toEqual(
                expect.objectContaining({
                    accessToken: 'accessToken',
                    refreshToken: 'refreshToken',
                }),
            );
            expect(refreshTokensRepository.Dao.update).toBeCalledTimes(1);
            expect(refreshTokensRepository.Dao.update).toBeCalledWith({
                where: {
                    id: 0,
                },
                data: { hash: 'e1eae9e373ba62a80cdbd4422fc002553447aeb38fdb8dbf511a52d3e8c5e417' },
            });
        });

        it('should return error if not found user', async () => {
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            userService.findUser.mockResolvedValueOnce(new CannotFindUser());

            const generatedResult = await authService.generateTokens(user.id, user.email);

            expect(isError(generatedResult)).toBeTruthy();
            expect(generatedResult).toBeInstanceOf(CannotFindUser);
        });
    });

    describe('generate refresh cookie', () => {
        it('should correct generate cookie with token', async () => {
            const refreshToken = {
                id: 0,
                hash: 'e1eae9e373ba62a80cdbd4422fc002553447aeb38fdb8dbf511a52d3e8c5e417',
                userId: 0,
                user,
            };
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            userService.findUser.mockResolvedValueOnce(user);
            refreshTokensRepository.Dao.create.mockResolvedValue(refreshToken);

            const generatedResult = await authService.generateTokensWithCookie(user.id, user.email);

            expect(isError(generatedResult)).toBeFalsy();
            expect(generatedResult).toEqual(
                expect.objectContaining({
                    accessToken: 'accessToken',
                    // eslint-disable-next-line max-len
                    refreshCookie: `Refresh=refreshToken; HttpOnly; Path=/; Max-Age=${configService.JWT_REFRESH_TOKEN_EXPIRATION_TIME}`,
                }),
            );
        });

        it('should return error if generating fail', async () => {
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            userService.findUser.mockResolvedValueOnce(new CannotFindUser());

            const generatedResult = await authService.generateTokensWithCookie(user.id, user.email);

            expect(isError(generatedResult)).toBeTruthy();
        });
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
            userService.createUser.mockResolvedValue(new BaseError('userAlreadyExist'));

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
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            userService.findUser.mockResolvedValueOnce(user);
            refreshTokensRepository.Dao.create.mockResolvedValue(refreshToken);

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
            userService.findVerifiedUser.mockResolvedValue(
                new BaseError('emailOrPasswordIncorrect'),
            );

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
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            userService.findUser.mockResolvedValueOnce(user);
            refreshTokensRepository.Dao.create.mockResolvedValue(refreshToken);

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
