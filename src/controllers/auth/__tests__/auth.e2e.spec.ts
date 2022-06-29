import * as cookieParser from 'cookie-parser';
import { sha256 } from './../../../utils/crypt.utils';
import { EmailAlreadyConfirmed, EmailNotConfirmed } from './../../../services/auth/auth.model';
import { getErrorStub } from './../../../__mocks__/error.stub';
import { UserAlreadyExist, EmailOrPasswordIncorrect } from './../../../services/user/user.model';
import * as request from 'supertest';
import { AuthControllerProvider } from './../auth.controller';
import { MailServiceProvider } from './../../../services/mail/mail.service';
import { RefreshTokensRepositoryProvider } from './../../../repositories/refreshTokens/refreshTokens.repository';
import { EmailConfirmsRepositoryProvider } from './../../../repositories/emailConfirms/emailConfirms.repository';
import { AuthServiceProvider } from './../../../services/auth/auth.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { HttpInterceptor } from '../../../core/interceptor.core';
import { ErrorsRepositoryProvider } from '../../../repositories/errors/errors.repository';
import { UsersRepositoryProvider } from '../../../repositories/users/users.repository';
import { JwtStrategy } from '../../../services/auth/strategies/jwt.strategy';
import { ConfigServiceProvider } from '../../../services/config/config.service';
import { ErrorsServiceProvider } from '../../../services/errors/errors.service';
import { UserServiceProvider } from '../../../services/user/user.service';
import { ConfigServiceFake } from '../../../__mocks__/ConfigServiceFake';
import { TransactionsContextFake } from '../../../__mocks__/TransactionsContextFake';
import { AppWrap } from './../../../utils/tests.utils';
import { JwtRefreshTokenStrategy } from '../../../services/auth/strategies/jwt-refresh.strategy';
import { getUserStub } from '../../../__mocks__/user.stub';
import { getConfirmEmailStub } from '../../../__mocks__/confirmEmail.stub';
import { DatabaseServiceProvider } from '../../../services/database/database.service';
import { EmailConfirm, RefreshToken, User } from '@prisma/client';

describe('AuthController', () => {
    const appWrap = {} as AppWrap;
    let authService: DeepMocked<AuthServiceProvider>;
    let userService: DeepMocked<UserServiceProvider>;
    let errorsService: DeepMocked<ErrorsServiceProvider>;
    let mailService: DeepMocked<MailServiceProvider>;
    let db: {
        Prisma: DeepMocked<DatabaseServiceProvider['Prisma']>;
    };

    let REFRESH_TOKEN: RefreshToken;
    let USER: User & { refreshToken: RefreshToken | null; emailConfirm: EmailConfirm | null };

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
                    provide: ErrorsServiceProvider,
                    useValue: createMock<ErrorsServiceProvider>(),
                },
                {
                    provide: MailServiceProvider,
                    useValue: createMock<MailServiceProvider>(),
                },
                JwtStrategy,
                JwtRefreshTokenStrategy,
            ],
            controllers: [AuthControllerProvider],
        }).compile();

        authService = module.get(AuthServiceProvider);
        userService = module.get(UserServiceProvider);
        errorsService = module.get(ErrorsServiceProvider);
        mailService = module.get(MailServiceProvider);
        db = module.get(DatabaseServiceProvider);

        appWrap.app = module.createNestApplication();
        appWrap.app.useGlobalInterceptors(
            new HttpInterceptor(db as unknown as DatabaseServiceProvider),
        );
        appWrap.app.use(cookieParser());
        await appWrap.app.init();

        db.Prisma.$transaction.mockImplementation((cb: (arg: any) => any) => cb({}));
    });

    afterAll(async () => {
        await appWrap.app.close();
    });

    beforeEach(() => {
        USER = getUserStub();
        REFRESH_TOKEN = {
            id: 0,
            hash: 'e1eae9e373ba62a80cdbd4422fc002553447aeb38fdb8dbf511a52d3e8c5e417',
            userId: 0,
        };
    });

    const successSetupForGenerateTokens = () => {
        userService.findVerifiedUser.mockResolvedValue({
            ...USER,
            emailConfirmed: true,
            hash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
        });
    };

    const successSetupSignIn = () => {
        userService.findVerifiedUser.mockResolvedValue({
            ...USER,
            emailConfirmed: true,
            hash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
        });
        successSetupForGenerateTokens();
    };

    describe('POST /api/auth/sign-up', () => {
        it('should work dto validation', async () => {
            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-up')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email });

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Bad Request');

            const response1 = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-up')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ password: '123456789' });

            expect(response1.statusCode).toBe(400);
            expect(response1.body.error).toBe('Bad Request');
        });
    });
});
