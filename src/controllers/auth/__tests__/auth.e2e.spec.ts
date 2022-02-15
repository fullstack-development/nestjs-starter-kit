import * as cookieParser from 'cookie-parser';
import { sha256 } from './../../../utils/crypt.utils';
import { CannotFindEmailConfirm } from './../../../repositories/emailConfirms/emailConfirm.model';
import {
    ConfirmationNotFound,
    EmailAlreadyConfirmed,
    EmailNotConfirmed,
} from './../../../services/auth/auth.model';
import { getErrorStub, getInsertResult } from './../../../__mocks__/error.stub';
import { CannotFindUser } from './../../../repositories/users/user.model';
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

describe('AuthController', () => {
    const appWrap = {} as AppWrap;
    let usersRepository: DeepMocked<UsersRepositoryProvider>;
    let errorsRepository: DeepMocked<ErrorsRepositoryProvider>;
    let emailConfirmsRepository: DeepMocked<EmailConfirmsRepositoryProvider>;
    let refreshTokensRepository: DeepMocked<RefreshTokensRepositoryProvider>;

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
                AuthServiceProvider,
                UserServiceProvider,
                ErrorsServiceProvider,
                MailServiceProvider,
                JwtStrategy,
                JwtRefreshTokenStrategy,
                {
                    provide: ConfigServiceProvider,
                    useClass: ConfigServiceFake,
                },
                {
                    provide: UsersRepositoryProvider,
                    useValue: createMock<UsersRepositoryProvider>(),
                },
                {
                    provide: EmailConfirmsRepositoryProvider,
                    useValue: createMock<EmailConfirmsRepositoryProvider>(),
                },
                {
                    provide: RefreshTokensRepositoryProvider,
                    useValue: createMock<RefreshTokensRepositoryProvider>(),
                },
                {
                    provide: ErrorsRepositoryProvider,
                    useValue: createMock<ErrorsRepositoryProvider>(),
                },
            ],
            controllers: [AuthControllerProvider],
        }).compile();

        usersRepository = module.get(UsersRepositoryProvider);
        errorsRepository = module.get(ErrorsRepositoryProvider);
        emailConfirmsRepository = module.get(EmailConfirmsRepositoryProvider);
        refreshTokensRepository = module.get(RefreshTokensRepositoryProvider);

        appWrap.app = module.createNestApplication();
        appWrap.app.useGlobalInterceptors(new HttpInterceptor());
        appWrap.app.use(cookieParser());
        await appWrap.app.init();
    });

    const successSetupForGenerateTokens = () => {
        usersRepository.findOneRelations.mockResolvedValue({
            ...getUserStub(),
            emailConfirmed: true,
            hash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
        });
        refreshTokensRepository.create.mockResolvedValue(0);
    };

    const successSetupSignIn = () => {
        usersRepository.findOne.mockResolvedValue({
            ...getUserStub(),
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
                .send({ password: '12345679' });

            expect(response1.statusCode).toBe(400);
            expect(response1.body.error).toBe('Bad Request');
        });

        it('should return error if user already exist', async () => {
            usersRepository.findOne.mockResolvedValue(getUserStub());
            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-up')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email, password: '12345678' });

            expect(response.statusCode).toBe(200);
            expect(response.body.error).toBe(new UserAlreadyExist().error);
        });

        it('should return error id if creating failure', async () => {
            usersRepository.findOne.mockResolvedValue(new CannotFindUser());
            errorsRepository.getNativeRepository().findOne.mockResolvedValue(getErrorStub());
            errorsRepository.getNativeRepository().insert.mockResolvedValue(getInsertResult());

            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-up')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email, password: '12345678' });

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual(expect.objectContaining({ errorId: expect.any(String) }));
        });

        it('should return error id if user created, but send confirmation email is failure', async () => {
            usersRepository.findOne.mockResolvedValueOnce(new CannotFindUser());
            usersRepository.findOne.mockResolvedValueOnce(getUserStub());
            emailConfirmsRepository.findOne.mockResolvedValue(getConfirmEmailStub());
            errorsRepository.getNativeRepository().findOne.mockResolvedValue(getErrorStub());
            errorsRepository.getNativeRepository().insert.mockResolvedValue(getInsertResult());

            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-up')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email, password: '12345678' });

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual(expect.objectContaining({ errorId: expect.any(String) }));
        });

        it('should success create new user and send email confirmation', async () => {
            usersRepository.findOne.mockResolvedValueOnce(new CannotFindUser());
            usersRepository.findOne.mockResolvedValue(getUserStub());
            emailConfirmsRepository.create.mockResolvedValue(0);
            emailConfirmsRepository.findOne.mockResolvedValue(getConfirmEmailStub());

            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-up')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email, password: '12345678' });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('POST /api/auth/sign-in', () => {
        it('should work dto validation', async () => {
            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-in')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email });

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Bad Request');

            const response1 = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-in')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ password: '12345679' });

            expect(response1.statusCode).toBe(400);
            expect(response1.body.error).toBe('Bad Request');
        });

        it('should return error if email or password incorrect', async () => {
            usersRepository.findOne.mockResolvedValueOnce(getUserStub());

            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-in')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email, password: '12345678' });

            expect(response.statusCode).toBe(200);
            expect(response.body.error).toBe(new EmailOrPasswordIncorrect().error);

            usersRepository.findOne.mockResolvedValueOnce(new CannotFindUser());

            const response1 = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-in')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email, password: '12345678' });

            expect(response1.statusCode).toBe(200);
            expect(response1.body.error).toBe(new EmailOrPasswordIncorrect().error);
        });

        it('should return error if email not confirmed', async () => {
            usersRepository.findOne.mockResolvedValueOnce({
                ...getUserStub(),
                hash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
            });

            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-in')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email, password: '12345678' });

            expect(response.statusCode).toBe(200);
            expect(response.body.error).toBe(new EmailNotConfirmed().error);
        });

        it('should success return access token and refresh in cookies', async () => {
            successSetupSignIn();

            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-in')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email, password: '12345678' });

            const refreshCookie = response.headers['set-cookie'][0].split(';')[0].split('=');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({ body: { accessToken: expect.any(String) } }),
            );
            expect(refreshCookie).toEqual(expect.arrayContaining(['Refresh', expect.any(String)]));
        });
    });

    describe('POST /api/auth/confirm-email', () => {
        it('should work dto validation', async () => {
            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/confirm-email')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({});

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Bad Request');
        });

        it('should return error, if email already confirmed', async () => {
            emailConfirmsRepository.findOne.mockResolvedValue(getConfirmEmailStub());
            usersRepository.findOne.mockResolvedValue({ ...getUserStub(), emailConfirmed: true });

            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/confirm-email')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ confirmUuid: 'uuid' });

            expect(response.statusCode).toBe(200);
            expect(response.body.error).toBe(new EmailAlreadyConfirmed().error);
        });

        it('should return error, if email confirmed not found', async () => {
            emailConfirmsRepository.findOne.mockResolvedValue(new CannotFindEmailConfirm());

            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/confirm-email')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ confirmUuid: 'uuid' });

            expect(response.statusCode).toBe(200);
            expect(response.body.error).toBe(new ConfirmationNotFound().error);
        });

        it('should success confirm email', async () => {
            successSetupForGenerateTokens();
            emailConfirmsRepository.findOne.mockResolvedValue(getConfirmEmailStub());
            usersRepository.findOne.mockResolvedValue(getUserStub());
            usersRepository.updateOne.mockResolvedValue(undefined);

            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/confirm-email')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ confirmUuid: 'uuid' });

            const refreshCookie = response.headers['set-cookie'][0].split(';')[0].split('=');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({ body: { accessToken: expect.any(String) } }),
            );
            expect(refreshCookie).toEqual(expect.arrayContaining(['Refresh', expect.any(String)]));
        });
    });

    describe('GET /api/auth/refresh', () => {
        it('should return 401, if no provide refresh token in cookies', async () => {
            const response = await request(appWrap.app.getHttpServer()).get('/api/auth/refresh');

            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual(expect.objectContaining({ message: 'Unauthorized' }));
        });

        it('should return 401, if provide incorrect refresh token in cookies', async () => {
            const response = await request(appWrap.app.getHttpServer())
                .get('/api/auth/refresh')
                .set('Cookie', ['Refresh=1234']);

            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual(expect.objectContaining({ message: 'Unauthorized' }));
        });

        it('should return 401, if provide old refresh token in cookies', async () => {
            successSetupSignIn();

            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-in')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email, password: '12345678' });

            const refreshCookie = response.headers['set-cookie'][0].split(';')[0];

            usersRepository.getNativeRepository().findOne.mockResolvedValue({
                ...getUserStub(),
                refreshToken: {
                    tokenHash: sha256('new refresh token'),
                    user: getUserStub(),
                    id: 0,
                },
            });

            const refreshResponse = await request(appWrap.app.getHttpServer())
                .get('/api/auth/refresh')
                .set('Cookie', [refreshCookie]);

            expect(refreshResponse.statusCode).toBe(401);
            expect(refreshResponse.body).toEqual(
                expect.objectContaining({ message: 'Unauthorized' }),
            );
        });

        it('should success return new tokens', async () => {
            const user = getUserStub();
            successSetupSignIn();

            const response = await request(appWrap.app.getHttpServer())
                .post('/api/auth/sign-in')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ email: getUserStub().email, password: '12345678' });

            const refreshCookie = response.headers['set-cookie'][0].split(';')[0];

            usersRepository.getNativeRepository().findOne.mockResolvedValue({
                ...user,
                refreshToken: { tokenHash: sha256(refreshCookie.split('=')[1]), user, id: 0 },
            });

            const refreshResponse = await request(appWrap.app.getHttpServer())
                .get('/api/auth/refresh')
                .set('Cookie', [refreshCookie]);

            const newRefreshCookie = response.headers['set-cookie'][0].split(';')[0].split('=');

            expect(refreshResponse.statusCode).toBe(200);
            expect(refreshResponse.body).toEqual(
                expect.objectContaining({ body: { accessToken: expect.any(String) } }),
            );
            expect(newRefreshCookie).toEqual(
                expect.arrayContaining(['Refresh', expect.any(String)]),
            );
        });
    });

    afterAll(async () => {
        await appWrap.app.close();
    });
});
