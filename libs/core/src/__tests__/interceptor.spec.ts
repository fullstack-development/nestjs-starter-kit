import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Controller, Get } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AsyncContext, DatabaseProvider, Transactions } from '../../../repository';
import { AppWrap } from '../../testing';
import { ErrorHandleMiddlewareProvider } from '../errorHandleMiddleware.core';
import { BaseError, UnprocessableEntityError } from '../errors.core';
import { HttpInterceptor } from '../interceptor.core';

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
        UnsafeRepository: DeepMocked<DatabaseProvider['UnsafeRepository']>;
    };

    beforeAll(async () => {
        const dbMock = createMock<DeepMocked<DatabaseProvider['UnsafeRepository']>>();
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: DatabaseProvider,
                    useValue: {
                        get UnsafeRepository() {
                            return dbMock;
                        },
                    },
                },
            ],
            controllers: [TestController],
        }).compile();

        moduleRef = createMock<ModuleRef>();

        db = module.get(DatabaseProvider);

        interceptor = new HttpInterceptor(
            moduleRef,
            createMock<AsyncContext<string, Transactions>>(),
            db as unknown as DatabaseProvider,
        );
        appWrap.app = module.createNestApplication();
        appWrap.app.useGlobalInterceptors(interceptor);
        await appWrap.app.init();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db.UnsafeRepository.$transaction.mockImplementation((cb: (arg: any) => any) => cb({}));
    });

    afterEach(() => {
        moduleRef.resolve.mockClear();
        testResponse.response.mockClear();
    });

    describe('intercept', () => {
        it('should return error on BaseError check', async () => {
            testResponse.response.mockReturnValueOnce(new BaseError(1, 500));
            const response = await request(appWrap.app.getHttpServer()).get('/test/request').send();

            expect(response.status).toEqual(500);
            expect(response.body).toEqual({
                error: 'Error',
                message: 'The type of the BaseError error property must be "string"',
            });
        });

        it('should return error on ControllerResponse or BaseError check', async () => {
            testResponse.response.mockReturnValueOnce(1);
            const response = await request(appWrap.app.getHttpServer()).get('/test/request').send();

            expect(response.status).toEqual(500);
            expect(response.body).toEqual({
                error: 'Error',
                message:
                    'Each endpoint return must be an instance of a ControllerResponse ' +
                    'or a BaseError<string>',
            });
        });

        it('should return ControllerResponse.Fail', async () => {
            testResponse.response.mockReturnValueOnce(new UnprocessableEntityError('testError'));
            const response = await request(appWrap.app.getHttpServer()).get('/test/request').send();

            expect(response.status).toEqual(422);
            expect(response.body).toEqual({
                error: 'testError',
            });

            testResponse.response.mockReturnValueOnce(new BaseError('Test Base Error', 422));
            const response2 = await request(appWrap.app.getHttpServer())
                .get('/test/request')
                .send();

            expect(response2.status).toEqual(422);
            expect(response2.body).toEqual({
                error: 'Test Base Error',
            });
        });

        it('should return a 500 error if userErrorOnly === false | undefined', async () => {
            testResponse.response.mockReturnValueOnce(new BaseError('Test Base Error', 500));
            const response = await request(appWrap.app.getHttpServer()).get('/test/request').send();
            expect(response.status).toEqual(500);
            expect(response.body).toEqual({
                error: 'Test Base Error',
            });

            testResponse.response.mockReturnValueOnce(new BaseError('Test Base Error', 500));
            const response2 = await request(appWrap.app.getHttpServer())
                .get('/test/request')
                .send();
            expect(response2.status).toEqual(500);
            expect(response2.body).toEqual({
                error: 'Test Base Error',
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
