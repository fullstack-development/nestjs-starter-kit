import { CannotFindError } from './../../../repositories/errors/errors.model';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { isError } from './../../../core/errors.core';
import { Test } from '@nestjs/testing';
import { ErrorEntity } from './../../../repositories/errors/errors.entity';
import { ErrorsServiceProvider } from './../errors.service';
import { getErrorStub } from './__mocks__/error.stub';
import { ErrorsRepositoryProvider } from '../../../repositories/errors/errors.repository';
import { InsertResult } from 'typeorm';

describe('ErrorsService', () => {
    let errorsService: ErrorsServiceProvider;
    let errorsRepository: DeepMocked<ErrorsRepositoryProvider>;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ErrorsServiceProvider,
                {
                    provide: ErrorsRepositoryProvider,
                    useValue: createMock<ErrorsRepositoryProvider>(),
                },
            ],
        }).compile();

        errorsService = module.get(ErrorsServiceProvider);
        errorsRepository = module.get(ErrorsRepositoryProvider);
    });

    it('should be defined service and repository', () => {
        expect(errorsService).toBeDefined();
        expect(errorsRepository).toBeDefined();
    });

    describe('handling error', () => {
        let error: ErrorEntity;
        beforeEach(() => {
            error = getErrorStub();
            errorsRepository.getNativeRepository().findOne.mockResolvedValue(error);
            errorsRepository
                .getNativeRepository()
                .insert.mockResolvedValue({ raw: [{ id: 0 }] } as InsertResult);
        });
        it('should return a uuid', async () => {
            const handleResult = await errorsService.handleError({ error: 'mock error' });

            expect(isError(handleResult)).toBeFalsy();
            expect(handleResult).toEqual(expect.objectContaining({ uuid: expect.any(String) }));
        });

        it('should return create error', async () => {
            errorsRepository
                .getNativeRepository()
                .insert.mockResolvedValue(undefined as unknown as InsertResult);

            const handleResult = await errorsService.handleError({ error: 'mock error' });

            expect(isError(handleResult)).toBeTruthy();
            expect(handleResult).toEqual(expect.objectContaining({ error: 'cannotCreateError' }));
        });

        it('should return find error', async () => {
            errorsRepository.getNativeRepository().findOne.mockResolvedValue(undefined);
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
            errorsRepository.findOne.mockResolvedValue(error);
        });

        it('should return error by uuid', async () => {
            const errorResult = await errorsService.getErrorByUuid({ uuid: 'test uuid' });

            expect(isError(errorResult)).toBeFalsy();
        });

        it('should return cannot find error by unknown uuid', async () => {
            errorsRepository.findOne.mockResolvedValue(new CannotFindError());
            const errorResult = await errorsService.getErrorByUuid({ uuid: 'incorrect uuid' });

            expect(isError(errorResult)).toBeTruthy();
        });
    });
});
