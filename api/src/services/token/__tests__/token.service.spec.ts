import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { isError } from '@lib/core';
import { DatabaseProvider } from '@lib/repository';
import { DatabaseRepositoriesMock, mockDatabaseRepositories } from '@lib/testing';
import { sha256 } from '@lib/utils';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ConfigProvider } from '../../../core/config/config.core';
import { ConfigServiceFake } from '../../../__mocks__/ConfigServiceFake';
import { getUserStub } from '../../../__mocks__/user.stub';
import { CannotFindUser } from '../../user/user.model';
import { UserServiceProvider } from '../../user/user.service';
import { UserType } from '../token.model';
import { TokenServiceProvider } from '../token.service';

describe('TokenService', () => {
    let tokenService: TokenServiceProvider;
    let configService: ConfigServiceFake;
    let jwtService: DeepMocked<JwtService>;
    let userService: DeepMocked<UserServiceProvider>;

    let db: DatabaseRepositoriesMock;

    let user: ReturnType<typeof getUserStub>;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TokenServiceProvider,
                { provide: ConfigProvider, useClass: ConfigServiceFake },
                {
                    provide: DatabaseProvider,
                    useValue: mockDatabaseRepositories(),
                },
                {
                    provide: JwtService,
                    useValue: createMock<JwtService>(),
                },
                {
                    provide: UserServiceProvider,
                    useValue: createMock<UserServiceProvider>(),
                },
            ],
        }).compile();

        configService = module.get(ConfigProvider);
        db = module.get(DatabaseProvider);
        tokenService = module.get(TokenServiceProvider);
        jwtService = module.get(JwtService);
        userService = module.get(UserServiceProvider);

        user = getUserStub();
    });

    it('should be defined service and all deps', () => {
        expect(db).toBeDefined();
        expect(tokenService).toBeDefined();
        expect(configService).toBeDefined();
        expect(userService).toBeDefined();
        expect(jwtService).toBeDefined();
    });

    describe('User', () => {
        describe('generate access and refresh tokens', () => {
            it('should success generate token for new user', async () => {
                jwtService.sign
                    .mockReturnValueOnce('refreshToken')
                    .mockReturnValueOnce('accessToken');
                userService.findUser.mockResolvedValueOnce(user);
                db.refreshToken.create.mockResolvedValue({
                    userId: 0,
                    id: 0,
                    hash: '',
                });

                const generatedResult = await tokenService.generate(
                    user.id,
                    UserType.USER,
                    user.email,
                );

                expect(isError(generatedResult)).toBeFalsy();
                expect(generatedResult).toEqual(
                    expect.objectContaining({
                        accessToken: 'accessToken',
                        refreshToken: 'refreshToken',
                    }),
                );
                expect(db.refreshToken.create).toBeCalledTimes(1);
                expect(db.refreshToken.create).toBeCalledWith({
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
                jwtService.sign
                    .mockReturnValueOnce('refreshToken')
                    .mockReturnValueOnce('accessToken');
                userService.findUser.mockResolvedValueOnce(userWithRefreshToken);
                db.refreshToken.update.mockResolvedValue(refreshToken);

                const generatedResult = await tokenService.generate(
                    user.id,
                    UserType.USER,
                    user.email,
                );

                expect(isError(generatedResult)).toBeFalsy();
                expect(generatedResult).toEqual(
                    expect.objectContaining({
                        accessToken: 'accessToken',
                        refreshToken: 'refreshToken',
                    }),
                );
                expect(db.refreshToken.update).toBeCalledTimes(1);
                expect(db.refreshToken.update).toBeCalledWith({
                    where: {
                        id: 0,
                    },
                    data: {
                        hash: 'e1eae9e373ba62a80cdbd4422fc002553447aeb38fdb8dbf511a52d3e8c5e417',
                    },
                });
            });

            it('should return error if not found user', async () => {
                jwtService.sign
                    .mockReturnValueOnce('refreshToken')
                    .mockReturnValueOnce('accessToken');
                userService.findUser.mockResolvedValueOnce(new CannotFindUser());

                const generatedResult = await tokenService.generate(
                    user.id,
                    UserType.USER,
                    user.email,
                );

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
                jwtService.sign
                    .mockReturnValueOnce('refreshToken')
                    .mockReturnValueOnce('accessToken');
                userService.findUser.mockResolvedValueOnce(user);
                db.refreshToken.create.mockResolvedValue(refreshToken);

                const generatedResult = await tokenService.generate(
                    user.id,
                    UserType.USER,
                    user.email,
                );

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
                jwtService.sign
                    .mockReturnValueOnce('refreshToken')
                    .mockReturnValueOnce('accessToken');
                userService.findUser.mockResolvedValueOnce(new CannotFindUser());

                const generatedResult = await tokenService.generate(
                    user.id,
                    UserType.USER,
                    user.email,
                );

                expect(isError(generatedResult)).toBeTruthy();
            });
        });
    });
});
