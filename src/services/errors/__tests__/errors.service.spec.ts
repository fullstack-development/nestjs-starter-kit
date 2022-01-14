import { BasicError, isError } from './../../../core/errors.core';
import { ErrorsRepositoryFake } from './__mocks__/ErrorsRepositoryFake';
import { Test } from '@nestjs/testing';
import { ErrorEntity } from './../../../repositories/errors/errors.entity';
import { ErrorsServiceProvider } from './../errors.service';
import { getErrorStub } from './__mocks__/error.stub';

describe('ErrorsService', () => {
    let errorsService: ErrorsServiceProvider;
    let errorsRepository: ErrorsRepositoryFake;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ErrorsServiceProvider,
                {
                    provide: 'ErrorsRepositoryProvider',
                    useClass: ErrorsRepositoryFake,
                },
            ],
        }).compile();

        errorsService = module.get<ErrorsServiceProvider>(ErrorsServiceProvider);
        errorsRepository = module.get<ErrorsRepositoryFake>('ErrorsRepositoryProvider');
    });

    it('should be defined service and repository', () => {
        expect(errorsService).toBeDefined();
        expect(errorsRepository).toBeDefined();
    });

    describe('handling error', () => {
        let error: ErrorEntity;
        beforeEach(() => {
            error = getErrorStub();
            errorsRepository.findOne.mockResolvedValue(error);
            errorsRepository.insert.mockResolvedValue({ raw: [{ id: 0 }] });
        });
        it('should return a uuid', async () => {
            const handleResult = await errorsService.handleError({ error: 'mock error' });

            expect(isError(handleResult)).toBeFalsy();
            expect(handleResult).toEqual(expect.objectContaining({ uuid: expect.any(String) }));
        });

        it('should return create error', async () => {
            errorsRepository.insert.mockResolvedValue(undefined);

            const handleResult = await errorsService.handleError({ error: 'mock error' });

            expect(isError(handleResult)).toBeTruthy();
            expect(handleResult).toEqual(expect.objectContaining({ error: 'cannotCreateError' }));
        });

        it('should return find error', async () => {
            errorsRepository.findOne.mockResolvedValue(undefined);
            const handleResult = await errorsService.handleError({ error: 'mock error' });

            expect(isError(handleResult)).toBeTruthy();
            expect(handleResult).toEqual(
                expect.objectContaining({ error: 'cannotFindNewlyCreatedError' }),
            );
        });
    });

    describe('find error by uuid', () => {
        let error: ErrorEntity;
        beforeEach(() => {
            error = getErrorStub();
            errorsRepository.findOne.mockReturnValue(Promise.resolve(error));
        });

        it('should return error by uuid', async () => {
            const errorResult = await errorsService.getErrorByUuid({ uuid: 'test uuid' });

            expect(isError(errorResult)).toBeFalsy();
        });

        it('should return cannot find error by unknown uuid', async () => {
            errorsRepository.findOne.mockReturnValue(Promise.resolve(new BasicError('test error')));
            const errorResult = await errorsService.getErrorByUuid({ uuid: 'incorrect uuid' });

            expect(isError(errorResult)).toBeTruthy();
        });
    });
});
