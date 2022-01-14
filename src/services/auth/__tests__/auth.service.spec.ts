import { BasicError } from './../../../core/errors.core';
import { RefreshTokensRepositoryFake } from './__mocks__/RefreshTokensRepositoryFake';
import { JwtServiceFake } from './__mocks__/JwtServiceFake';
import { EmailConfirmsRepositoryFake } from './__mocks__/EmailConfirmsFake';
import { UsersRepositoryFake } from './__mocks__/UsersRepositoryFake';
import { ConfigServiceFake } from './__mocks__/ConfigServiceFake';
import { Test } from '@nestjs/testing';
import { AuthServiceProvider } from '../auth.service';
import { UserServiceFake } from './__mocks__/UserServiceFake';
import { MailServiceFake } from './__mocks__/MailServiceFake';
import { UserEntity } from '../../../repositories/users/user.entity';
import { getUserStub } from './__mocks__/user.stub';
import { isError } from '../../../core/errors.core';
import { EmailConfirmEntity } from '../../../repositories/emailConfirms/emailConfirm.entity';
import { getConfirmEmailStub } from './__mocks__/confirmEmail.stub';

describe('AuthService', () => {
    let authService: AuthServiceProvider;
    let configService: ConfigServiceFake;
    let usersRepository: UsersRepositoryFake;
    let emailConfirmsRepository: EmailConfirmsRepositoryFake;
    let jwtService: JwtServiceFake;
    let refreshTokensRepository: RefreshTokensRepositoryFake;
    let userService: UserServiceFake;
    let mailService: MailServiceFake;

    let user: UserEntity;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthServiceProvider,
                { provide: 'ConfigServiceProvider', useClass: ConfigServiceFake },
                { provide: 'UsersRepositoryProvider', useClass: UsersRepositoryFake },
                {
                    provide: 'EmailConfirmsRepositoryProvider',
                    useClass: EmailConfirmsRepositoryFake,
                },
                {
                    provide: 'JwtService',
                    useClass: JwtServiceFake,
                },
                {
                    provide: 'RefreshTokensRepositoryProvider',
                    useClass: RefreshTokensRepositoryFake,
                },
                {
                    provide: 'UserServiceProvider',
                    useClass: UserServiceFake,
                },
                {
                    provide: 'MailServiceProvider',
                    useClass: MailServiceFake,
                },
            ],
        }).compile();

        authService = module.get(AuthServiceProvider);
        configService = module.get('ConfigServiceProvider');
        usersRepository = module.get('UsersRepositoryProvider');
        emailConfirmsRepository = module.get('EmailConfirmsRepositoryProvider');
        jwtService = module.get('JwtService');
        refreshTokensRepository = module.get('RefreshTokensRepositoryProvider');
        userService = module.get('UserServiceProvider');
        mailService = module.get('MailServiceProvider');
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
            usersRepository.findOneRelations.mockResolvedValue(user);
            refreshTokensRepository.create.mockResolvedValue(0);

            const generatedResult = await authService.generateTokens(user.id, user.email);

            expect(isError(generatedResult)).toBeFalsy();
            expect(generatedResult).toEqual(
                expect.objectContaining({
                    accessToken: 'accessToken',
                    refreshToken: 'refreshToken',
                }),
            );
        });

        it('should success update token for user with old refresh token', async () => {
            const userWithRefreshToken: UserEntity = {
                ...getUserStub(),
                refreshToken: {
                    id: 0,
                    tokenHash: 'e1eae9e373ba62a80cdbd4422fc002553447aeb38fdb8dbf511a52d3e8c5e417',
                    user,
                },
            };
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            usersRepository.findOneRelations.mockResolvedValue(userWithRefreshToken);
            refreshTokensRepository.updateOne.mockResolvedValue(undefined);

            const generatedResult = await authService.generateTokens(user.id, user.email);

            expect(isError(generatedResult)).toBeFalsy();
            expect(generatedResult).toEqual(
                expect.objectContaining({
                    accessToken: 'accessToken',
                    refreshToken: 'refreshToken',
                }),
            );
        });

        it('should return error if not found user', async () => {
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            usersRepository.findOneRelations.mockResolvedValue(new BasicError('cannotFindUser'));

            const generatedResult = await authService.generateTokens(user.id, user.email);

            expect(isError(generatedResult)).toBeTruthy();
            expect(generatedResult).toEqual(
                expect.objectContaining({
                    error: 'cannotFindUser',
                }),
            );
        });

        it('should return error if not created refresh token', async () => {
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            usersRepository.findOneRelations.mockResolvedValue(user);
            refreshTokensRepository.create.mockResolvedValue(undefined);

            const generatedResult = await authService.generateTokens(user.id, user.email);

            expect(isError(generatedResult)).toBeTruthy();
            expect(generatedResult).toEqual(
                expect.objectContaining({
                    error: 'cannotCreateRefreshToken',
                }),
            );
        });

        it('should return error if not updated refresh token', async () => {
            const userWithRefreshToken: UserEntity = {
                ...getUserStub(),
                refreshToken: {
                    id: 0,
                    tokenHash: 'e1eae9e373ba62a80cdbd4422fc002553447aeb38fdb8dbf511a52d3e8c5e417',
                    user,
                },
            };
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            usersRepository.findOneRelations.mockResolvedValue(userWithRefreshToken);
            refreshTokensRepository.updateOne.mockResolvedValue(
                new BasicError('cannotUpdateRefreshToken'),
            );

            const generatedResult = await authService.generateTokens(user.id, user.email);

            expect(isError(generatedResult)).toBeTruthy();
            expect(generatedResult).toEqual(
                expect.objectContaining({
                    error: 'cannotUpdateRefreshToken',
                }),
            );
        });
    });

    describe('generate refresh cookie', () => {
        it('should correct generate cookie with token', async () => {
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            usersRepository.findOneRelations.mockResolvedValue(user);
            refreshTokensRepository.create.mockResolvedValue(0);

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
            usersRepository.findOneRelations.mockResolvedValue(new BasicError('cannotFindUser'));

            const generatedResult = await authService.generateTokensWithCookie(user.id, user.email);

            expect(isError(generatedResult)).toBeTruthy();
        });
    });

    describe('sign-up', () => {
        let confirmMail: EmailConfirmEntity;

        beforeEach(() => {
            confirmMail = getConfirmEmailStub();
        });

        it('should correct sign-up', async () => {
            userService.createUser.mockResolvedValue(user);
            userService.findUser.mockResolvedValue(user);
            emailConfirmsRepository.create.mockResolvedValue(0);
            emailConfirmsRepository.findOne.mockResolvedValue(confirmMail);

            const createdResult = await authService.signUp({
                email: 'test@example.com',
                password: '12345678',
            });

            expect(isError(createdResult)).toBeFalsy();
        });

        it('should return error if user already exist', async () => {
            userService.createUser.mockResolvedValue(new BasicError('userAlreadyExist'));

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
            userService.findVerifiedUser.mockResolvedValue({ ...user, emailConfirmed: true });
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            usersRepository.findOneRelations.mockResolvedValue(user);
            refreshTokensRepository.create.mockResolvedValue(user.id);

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
                new BasicError('emailOrPasswordIncorrect'),
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
        let confirmMail: EmailConfirmEntity;

        beforeEach(() => {
            confirmMail = getConfirmEmailStub();
        });

        it('should confirm email', async () => {
            emailConfirmsRepository.findOne.mockResolvedValue(confirmMail);
            userService.findUser.mockResolvedValue(user);
            userService.confirmEmail.mockResolvedValue(true);
            jwtService.sign.mockReturnValueOnce('refreshToken').mockReturnValueOnce('accessToken');
            usersRepository.findOneRelations.mockResolvedValue(user);
            refreshTokensRepository.create.mockResolvedValue(user.id);

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
            emailConfirmsRepository.findOne.mockResolvedValue(confirmMail);
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
            emailConfirmsRepository.findOne.mockResolvedValue(new BasicError(''));

            const confirmResult = await authService.confirmEmail('1');

            expect(isError(confirmResult)).toBeTruthy();
            expect(confirmResult).toEqual(
                expect.objectContaining({
                    error: 'confirmationNotFound',
                }),
            );
        });
    });
});
