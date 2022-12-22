import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { Repositories } from '@modules/repository';
import { ModuleRef } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { omit } from 'ramda';
import * as request from 'supertest';
import { ConfigProvider } from '../../../core/config/config.core';
import { DatabaseProvider } from '../../../core/database/database.core';
import { HttpInterceptor } from '../../../core/interceptor.core';
import { JwtRefreshTokenStrategy } from '../../../services/auth/strategies/jwt-refresh.strategy';
import { JwtStrategy } from '../../../services/auth/strategies/jwt.strategy';
import { UserServiceProvider } from '../../../services/user/user.service';
import { AppWrap, DatabasePrismaMock, mockDatabasePrisma } from '../../../utils/tests.utils';
import { ConfigServiceFake } from '../../../__mocks__/ConfigServiceFake';
import { TransactionsContextFake } from '../../../__mocks__/TransactionsContextFake';
import { getUserStub } from '../../../__mocks__/user.stub';
import { UserControllerProvider } from './../user.controller';

describe('UserController', () => {
    const appWrap = {} as AppWrap;
    let db: { Prisma: DatabasePrismaMock<Repositories.User> };
    let userService: DeepMocked<UserServiceProvider>;
    let config: ConfigServiceFake;
    let jwtService: DeepMocked<JwtService>;

    let user: ReturnType<typeof getUserStub>;

    const getAuthToken = () => {
        db.Prisma.user.findFirst.mockResolvedValueOnce(user);
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
                RequestContextModule.forRoot({
                    contextClass: TransactionsContextFake,
                    isGlobal: true,
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
                    useValue: { Prisma: mockDatabasePrisma(Repositories.User) },
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
            new HttpInterceptor(createMock<ModuleRef>(), db as unknown as DatabaseProvider),
        );
        appWrap.app.use(cookieParser());
        await appWrap.app.init();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db.Prisma.$transaction.mockImplementation((cb: (arg: any) => any) => cb({}));
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
            expect(omit(['created'], response.body.data)).toEqual(
                omit(['refreshToken', 'created', 'emailConfirm', 'hash'], user),
            );
        });
    });
});
