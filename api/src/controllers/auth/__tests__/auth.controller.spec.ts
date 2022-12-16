import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AuthControllerProvider } from '../auth.controller';
import { MailServiceProvider } from '../../../services/mail/mail.service';
import { AuthServiceProvider } from '../../../services/auth/auth.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { HttpInterceptor } from '../../../core/interceptor.core';
import { JwtStrategy } from '../../../services/auth/strategies/jwt.strategy';
import { ConfigServiceProvider } from '../../../services/config/config.service';
import { UserServiceProvider } from '../../../services/user/user.service';
import { ConfigServiceFake } from '../../../__mocks__/ConfigServiceFake';
import { TransactionsContextFake } from '../../../__mocks__/TransactionsContextFake';
import { AppWrap } from '../../../utils/tests.utils';
import { JwtRefreshTokenStrategy } from '../../../services/auth/strategies/jwt-refresh.strategy';
import { getUserStub } from '../../../__mocks__/user.stub';
import { DatabaseServiceProvider } from '../../../services/database/database.service';
import { ModuleRef } from '@nestjs/core';
import { TokenServiceProvider } from '../../../services/token/token.service';

describe('AuthController', () => {
    const appWrap = {} as AppWrap;
    let db: {
        Prisma: DeepMocked<DatabaseServiceProvider['Prisma']>;
    };
    let authService: DeepMocked<AuthServiceProvider>;

    beforeAll(async () => {
        const dbMock = createMock<DeepMocked<DatabaseServiceProvider['Prisma']>>();
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
                    useValue: {
                        get Prisma() {
                            return dbMock;
                        },
                    },
                },
                {
                    provide: AuthServiceProvider,
                    useValue: createMock<AuthServiceProvider>(),
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
                JwtStrategy,
                JwtRefreshTokenStrategy,
            ],
            controllers: [AuthControllerProvider],
        }).compile();
        db = module.get(DatabaseServiceProvider);
        authService = module.get(AuthServiceProvider);

        appWrap.app = module.createNestApplication();
        appWrap.app.useGlobalInterceptors(
            new HttpInterceptor(createMock<ModuleRef>(), db as unknown as DatabaseServiceProvider),
        );
        appWrap.app.use(cookieParser());
        await appWrap.app.init();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db.Prisma.$transaction.mockImplementation((cb: (arg: any) => any) => cb({}));
    });

    afterAll(async () => {
        await appWrap.app.close();
    });

    describe('POST /api/auth/sign-up', () => {
        it('dto validation', async () => {
            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-up')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email });

            expect(response.statusCode).toEqual(400);
            expect(response.body.error).toEqual('Bad Request');

            const response1 = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-up')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ password: '123456789' });

            expect(response1.statusCode).toEqual(400);
            expect(response1.body.error).toEqual('Bad Request');
        });

        it('should return valid response', async () => {
            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-up')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email, password: '123456789' });

            expect(authService.signUp).toBeCalledWith({
                email: getUserStub().email,
                password: '123456789',
            });
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({ success: true });
        });
    });

    describe('POST /api/auth/sign-in', () => {
        it('dto validation', async () => {
            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-in')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email });

            expect(response.statusCode).toEqual(400);
            expect(response.body.error).toEqual('Bad Request');

            const response1 = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-in')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ password: '123456789' });

            expect(response1.statusCode).toEqual(400);
            expect(response1.body.error).toEqual('Bad Request');
        });

        it('should return valid response', async () => {
            authService.signIn.mockResolvedValueOnce({
                accessToken: '1',
                refreshCookie: '2',
                refreshToken: '2',
            });
            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-in')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email, password: '123456789' });

            expect(authService.signIn).toBeCalledWith({
                email: getUserStub().email,
                password: '123456789',
            });
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({
                success: true,
                data: '1',
            });
            expect(response.headers['set-cookie']).toEqual(['2']);
        });
    });

    describe('POST /api/auth/confirm-email', () => {
        it('dto validation', async () => {
            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/confirm-email')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({});

            expect(response.statusCode).toEqual(400);
            expect(response.body.error).toEqual('Bad Request');
        });

        it('should return valid response', async () => {
            authService.confirmEmail.mockResolvedValueOnce({
                accessToken: '1',
                refreshCookie: '2',
                refreshToken: '2',
            });
            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/confirm-email')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ confirmUuid: '123' });

            expect(authService.confirmEmail).toBeCalledWith('123');
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({
                success: true,
                data: '1',
            });
            expect(response.headers['set-cookie']).toEqual(['2']);
        });
    });
});
