import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { HttpInterceptor } from '../../../core/interceptor.core';
import { JwtStrategy } from '../../../services/auth/strategies/jwt.strategy';
import { ConfigServiceProvider } from '../../../services/config/config.service';
import { UserServiceProvider } from '../../../services/user/user.service';
import { ConfigServiceFake } from '../../../__mocks__/ConfigServiceFake';
import { TransactionsContextFake } from '../../../__mocks__/TransactionsContextFake';
import { AppWrap, checkSecureEndpoint } from '../../../utils/tests.utils';
import { JwtRefreshTokenStrategy } from '../../../services/auth/strategies/jwt-refresh.strategy';
import { getUserStub } from '../../../__mocks__/user.stub';
import { DatabaseServiceProvider } from '../../../services/database/database.service';
import { ModuleRef } from '@nestjs/core';
import { LoggerProvider } from '../../../core/logger.core';
import { UserControllerProvider } from '../user.controller';
import { EmailConfirm, RefreshToken, User } from '@prisma/client';
import {
    DeepMockedDatabaseServiceProvider,
    getMockedDatabase,
} from '../../../__mocks__/DatabaseServiceProviderFake';

describe('UserController', () => {
    const appWrap = {} as AppWrap;
    let db: DeepMockedDatabaseServiceProvider;
    let userService: DeepMocked<UserServiceProvider>;
    let jwtService: JwtService;

    beforeAll(async () => {
        const dbMock = getMockedDatabase();
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
                    provide: ConfigServiceProvider,
                    useClass: ConfigServiceFake,
                },
                {
                    provide: DatabaseServiceProvider,
                    useValue: dbMock,
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
        db = module.get(DatabaseServiceProvider);
        userService = module.get(UserServiceProvider);
        jwtService = module.get(JwtService);

        appWrap.app = module.createNestApplication();
        appWrap.app.useGlobalInterceptors(
            new HttpInterceptor(
                createMock<ModuleRef>(),
                db as unknown as DatabaseServiceProvider,
                createMock<LoggerProvider>(),
            ),
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
        let user: User & {
            refreshToken: RefreshToken | null;
            emailConfirm: EmailConfirm | null;
        };

        beforeEach(() => {
            user = getUserStub();
        });

        checkSecureEndpoint({
            url: '/api/user/me',
            methodName: 'me',
            controller: UserControllerProvider,
            appWrap,
            db: {
                get get() {
                    return db;
                },
            },
            jwtService: {
                get get() {
                    return jwtService;
                },
            },
        });

        it('should return valid response', async () => {
            db.Prisma.user.findFirst.mockResolvedValueOnce(user);
            userService.findUser.mockResolvedValueOnce(user);
            const token = jwtService.sign({ id: user.id, email: user.email });
            const response = await request(appWrap.app.getHttpServer())
                .get('/api/user/me')
                .auth(token, { type: 'bearer' });

            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({
                success: true,
                data: {
                    email: user.email,
                    emailConfirmed: user.emailConfirmed,
                    created: user.created,
                },
            });
            expect(userService.findUser).toBeCalledWith({ id: user.id, email: user.email });
        });
    });
});
