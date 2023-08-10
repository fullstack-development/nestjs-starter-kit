import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpInterceptor } from '@lib/core';
import { AsyncContext, DatabaseProvider, Repositories, Transactions } from '@lib/repository';
import { AppWrap, DatabaseUnsafeRepositoryMock, mockDatabaseUnsafeRepository } from '@lib/testing';
import { ModuleRef } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { omit } from 'ramda';
import * as request from 'supertest';
import { ConfigProvider } from '../../../../core/config/config.core';
import { JwtRefreshTokenStrategy } from '../../../../services/auth/strategies/jwt-refresh.strategy';
import { JwtStrategy } from '../../../../services/auth/strategies/jwt.strategy';
import { UserServiceProvider } from '../../../../services/user/user.service';
import { ConfigServiceFake } from '../../../../__mocks__/ConfigServiceFake';
import { getUserStub } from '../../../../__mocks__/user.stub';
import { UserControllerProvider } from './../user.controller';

describe('UserController', () => {
    const appWrap = {} as AppWrap;
    let db: { UnsafeRepository: DatabaseUnsafeRepositoryMock<Repositories.User> };
    let userService: DeepMocked<UserServiceProvider>;
    let config: ConfigServiceFake;
    let jwtService: DeepMocked<JwtService>;

    let user: ReturnType<typeof getUserStub>;

    const getAuthToken = () => {
        db.UnsafeRepository.user.findFirst.mockResolvedValueOnce(user);
        return jwtService.sign(
            { email: user.email },
            {
                secret: config.JWT_SECRET,
                expiresIn: config.JWT_EXPIRES_IN,
            },
        );
    };

    beforeAll(async () => {
        const configService = new ConfigServiceFake();
        const module = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    secret: configService.JWT_SECRET,
                    signOptions: { expiresIn: configService.JWT_EXPIRES_IN },
                }),
            ],
            providers: [
                {
                    provide: ConfigProvider,
                    useClass: ConfigServiceFake,
                },
                {
                    provide: JwtService,
                    useValue: createMock<JwtService>(),
                },
                {
                    provide: DatabaseProvider,
                    useValue: { UnsafeRepository: mockDatabaseUnsafeRepository(Repositories.User) },
                },
                {
                    provide: UserServiceProvider,
                    useValue: createMock<UserServiceProvider>(),
                },
                JwtStrategy,
                JwtRefreshTokenStrategy,
            ],
            controllers: [UserControllerProvider],
        }).compile();

        db = module.get(DatabaseProvider);
        userService = module.get(UserServiceProvider);
        config = module.get(ConfigProvider);
        jwtService = module.get(JwtService);

        user = getUserStub();

        appWrap.app = module.createNestApplication();
        appWrap.app.useGlobalInterceptors(
            new HttpInterceptor(
                createMock<ModuleRef>(),
                createMock<AsyncContext<string, Transactions>>(),
                db as unknown as DatabaseProvider,
            ),
        );
        appWrap.app.use(cookieParser());
        await appWrap.app.init();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db.UnsafeRepository.$transaction.mockImplementation((cb: (arg: any) => any) => cb({}));
    });

    afterAll(async () => {
        await appWrap.app.close();
    });

    describe('GET /api/user/me', () => {
        it('should return 401 on invalid credentials', async () => {
            const response = await request(appWrap.app.getHttpServer()).get('/api/user/me').send();

            expect(response.statusCode).toEqual(401);
            expect(response.body.message).toEqual('Unauthorized');
        });

        it('should success return user', async () => {
            userService.findUser.mockResolvedValue(user);

            const token = getAuthToken();

            const response = await request(appWrap.app.getHttpServer())
                .get('/api/user/me')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .auth(token, { type: 'bearer' })
                .send();

            expect(response.statusCode).toEqual(200);
            expect(omit(['created'], response.body)).toEqual(
                omit(['refreshToken', 'created', 'emailConfirm', 'hash'], user),
            );
        });
    });
});