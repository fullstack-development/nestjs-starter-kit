import * as request from 'supertest';
import { HttpInterceptor } from '../../../core/interceptor.core';
import { ErrorsServiceProvider } from '../../../services/errors/errors.service';
import { Test } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UsersRepositoryProvider } from '../../../repositories/users/users.repository';
import { getUserStub } from '../../../__mocks__/user.stub';
import { UserControllerProvider } from '../user.controller';
import { ErrorsRepositoryProvider } from '../../../repositories/errors/errors.repository';
import { UserServiceProvider } from '../../../services/user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigServiceProvider } from '../../../services/config/config.service';
import { JwtStrategy } from '../../../services/auth/strategies/jwt.strategy';
import { ConfigServiceFake } from '../../../__mocks__/ConfigServiceFake';
import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { TransactionsContextFake } from '../../../__mocks__/TransactionsContextFake';
import * as R from 'ramda';
import { UserEntity } from '../../../repositories/users/user.entity';
import { CannotFindUser } from '../../../repositories/users/user.model';
import { AppWrap, checkSecureEndpoint } from '../../../utils/tests.utils';

describe('UserController', () => {
    const appWrap = {} as AppWrap;
    let usersRepository: DeepMocked<UsersRepositoryProvider>;
    let jwtService: JwtService;

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
                UserServiceProvider,
                ErrorsServiceProvider,
                JwtStrategy,
                {
                    provide: ConfigServiceProvider,
                    useClass: ConfigServiceFake,
                },
                {
                    provide: UsersRepositoryProvider,
                    useValue: createMock<UsersRepositoryProvider>(),
                },
                {
                    provide: ErrorsRepositoryProvider,
                    useValue: createMock<ErrorsRepositoryProvider>(),
                },
            ],
            controllers: [UserControllerProvider],
        }).compile();

        usersRepository = module.get(UsersRepositoryProvider);
        jwtService = module.get(JwtService);
        appWrap.app = module.createNestApplication();
        appWrap.app.useGlobalInterceptors(new HttpInterceptor());
        await appWrap.app.init();
    });

    describe('GET /api/user/me', () => {
        let user: UserEntity;

        beforeEach(() => {
            user = getUserStub();
        });

        checkSecureEndpoint({
            url: '/api/user/me',
            methodName: 'me',
            controller: UserControllerProvider,
            appWrap,
        });

        it('should return 401 error if user not found in DB, but token is valid', async () => {
            const token = jwtService.sign({ email: user.email });
            usersRepository.getNativeRepository().findOne.mockResolvedValue(undefined);

            const response = await request(appWrap.app.getHttpServer())
                .get('/api/user/me')
                .auth(token, { type: 'bearer' });

            expect(response.statusCode).toEqual(401);
            expect(response.body).toEqual(expect.objectContaining({ message: 'Unauthorized' }));
        });

        it('should return cannot find error if user exist but not returned from db', async () => {
            const token = jwtService.sign({ email: user.email });
            usersRepository.findOne.mockResolvedValue(new CannotFindUser());
            usersRepository.getNativeRepository().findOne.mockResolvedValue(user);

            const response = await request(appWrap.app.getHttpServer())
                .get('/api/user/me')
                .auth(token, { type: 'bearer' });

            expect(response.statusCode).toEqual(200);
            expect(response.body.error).toEqual(new CannotFindUser().error);
        });

        it('should return 500 error if throw exception', async () => {
            const token = jwtService.sign({ email: user.email });
            usersRepository.getNativeRepository().findOne.mockResolvedValue(user);
            usersRepository.findOne.mockImplementation(() => {
                throw new Error('exception');
            });

            const response = await request(appWrap.app.getHttpServer())
                .get('/api/user/me')
                .auth(token, { type: 'bearer' });

            expect(response.statusCode).toEqual(500);
            expect(response.text).toEqual('exception');
        });

        it('should success return user', async () => {
            const token = jwtService.sign({ email: user.email });
            usersRepository.getNativeRepository().findOne.mockResolvedValue(user);
            usersRepository.findOne.mockResolvedValue(user);
            const response = await request(appWrap.app.getHttpServer())
                .get('/api/user/me')
                .auth(token, { type: 'bearer' });

            expect(response.statusCode).toEqual(200);
            expect(response.body.body).toEqual(R.omit(['refreshToken', 'hash', 'id'], user));
        });
    });

    afterAll(async () => {
        await appWrap.app.close();
    });
});
