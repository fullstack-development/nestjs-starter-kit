import { BaseError } from '../errors.core';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { DatabaseServiceProvider } from '../../services/database/database.service';
import { HttpInterceptor } from '../interceptor.core';
import { ModuleRef } from '@nestjs/core';
import { Controller, Get } from '@nestjs/common';
import { ErrorHandleMiddlewareProvider } from '../errorHandleMiddleware.core';
import { AppWrap } from '../../utils/tests.utils';
import { Test } from '@nestjs/testing';
import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { TransactionsContextFake } from '../../__mocks__/TransactionsContextFake';
import * as request from 'supertest';
import { ControllerResponse } from '../controller.core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const testResponse = createMock<{ response: () => any }>();

@Controller('/test')
class TestController {
    @Get('/request')
    request() {
        return testResponse.response();
    }
}

describe('Interceptor', () => {
    const appWrap = {} as AppWrap;

    let interceptor: HttpInterceptor;
    let moduleRef: DeepMocked<ModuleRef>;
    let db: {
        Prisma: DeepMocked<DatabaseServiceProvider['Prisma']>;
    };

    beforeAll(async () => {
        const dbMock = createMock<DeepMocked<DatabaseServiceProvider['Prisma']>>();
        const module = await Test.createTestingModule({
            imports: [
                RequestContextModule.forRoot({
                    contextClass: TransactionsContextFake,
                    isGlobal: true,
                }),
            ],
            providers: [
                {
                    provide: DatabaseServiceProvider,
                    useValue: {
                        get Prisma() {
                            return dbMock;
                        },
                    },
                },
            ],
            controllers: [TestController],
        }).compile();

        moduleRef = createMock<ModuleRef>();

        db = module.get(DatabaseServiceProvider);

        interceptor = new HttpInterceptor(moduleRef, db as unknown as DatabaseServiceProvider);
        appWrap.app = module.createNestApplication();
        appWrap.app.useGlobalInterceptors(interceptor);
        await appWrap.app.init();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db.Prisma.$transaction.mockImplementation((cb: (arg: any) => any) => cb({}));
    });

    afterEach(() => {
        moduleRef.resolve.mockClear();
        testResponse.response.mockClear();
    });

    describe('intercept', () => {
        it('should return error on BaseError check', async () => {
            testResponse.response.mockReturnValueOnce(new BaseError(1));
            const response = await request(appWrap.app.getHttpServer()).get('/test/request').send();

            expect(response.status).toEqual(500);
            expect(response.body).toEqual({
                error: 'Error',
                errorUniqId: '',
                message: 'The type of the BaseError error property must be "string"',
            });
        });

        it('should return error on ControllerResponse or BaseError check', async () => {
            testResponse.response.mockReturnValueOnce(1);
            const response = await request(appWrap.app.getHttpServer()).get('/test/request').send();

            expect(response.status).toEqual(500);
            expect(response.body).toEqual({
                error: 'Error',
                errorUniqId: '',
                message:
                    'Each endpoint return must be an instance of a ControllerResponse ' +
                    'or a BaseError<string>',
            });
        });

        it('should return ControllerResponse.Fail', async () => {
            testResponse.response.mockReturnValueOnce(
                ControllerResponse.Fail({ error: 'Test ControllerResponse Error' }),
            );
            const response = await request(appWrap.app.getHttpServer()).get('/test/request').send();

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
                success: false,
                data: {
                    error: 'Test ControllerResponse Error',
                },
            });

            testResponse.response.mockReturnValueOnce(
                new BaseError('Test Base Error', { userErrorOnly: true }),
            );
            const response2 = await request(appWrap.app.getHttpServer())
                .get('/test/request')
                .send();

            expect(response2.status).toEqual(200);
            expect(response2.body).toEqual({
                success: false,
                data: {
                    error: 'Test Base Error',
                },
            });
        });

        it('should return a 500 error if userErrorOnly === false | undefined', async () => {
            testResponse.response.mockReturnValueOnce(new BaseError('Test Base Error'));
            const response = await request(appWrap.app.getHttpServer()).get('/test/request').send();
            expect(response.status).toEqual(500);
            expect(response.body).toEqual({
                error: 'Test Base Error',
                errorUniqId: '',
            });

            testResponse.response.mockReturnValueOnce(
                new BaseError('Test Base Error', { userErrorOnly: false }),
            );
            const response2 = await request(appWrap.app.getHttpServer())
                .get('/test/request')
                .send();
            expect(response2.status).toEqual(500);
            expect(response2.body).toEqual({
                error: 'Test Base Error',
                errorUniqId: '',
            });
        });

        it('should catch HttpError', async () => {
            testResponse.response.mockImplementationOnce(() => {
                throw { status: 400, response: 'Bad request' };
            });
            const response = await request(appWrap.app.getHttpServer()).get('/test/request').send();

            expect(response.status).toEqual(400);
            expect(response.text).toEqual('Bad request');
        });

        it('should catch Unknown error', async () => {
            testResponse.response.mockImplementationOnce(() => {
                throw 'Test error';
            });
            const response = await request(appWrap.app.getHttpServer()).get('/test/request').send();
            expect(response.status).toEqual(500);
            expect(response.body).toEqual({
                error: 'Unknown error',
                message: 'Test error',
                errorUniqId: '',
            });

            testResponse.response.mockImplementationOnce(() => {
                throw { error: 'Test error', message: ['msg1', 'msg2'] };
            });
            const response2 = await request(appWrap.app.getHttpServer())
                .get('/test/request')
                .send();
            expect(response2.status).toEqual(500);
            expect(response2.body).toEqual({
                error: 'Unknown error',
                message: JSON.stringify({ error: 'Test error', message: ['msg1', 'msg2'] }),
                errorUniqId: '',
            });
        });
    });

    describe('onModuleInit and errorHandleMiddleware', () => {
        const errorHandleMiddleware = createMock<ErrorHandleMiddlewareProvider>();

        it('errorHandleMiddleware should be called', async () => {
            moduleRef.resolve.mockResolvedValueOnce(errorHandleMiddleware);
            testResponse.response.mockImplementationOnce(() => {
                throw 'Test error';
            });

            await interceptor.onModuleInit();
            await request(appWrap.app.getHttpServer()).get('/test/request').send();

            expect(errorHandleMiddleware.handleError).toBeCalledTimes(1);
            expect(errorHandleMiddleware.handleError).toBeCalledWith('Test error');
        });
    });
});
