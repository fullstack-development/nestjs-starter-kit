import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BaseError, isError } from './../../../core/errors.core';
import { Test } from '@nestjs/testing';
import { ErrorsServiceProvider } from './../errors.service';
import { getErrorStub } from '../../../__mocks__/error.stub';
import { ErrorsRepositoryProvider } from '../../../repositories/errors/errors.repository';
import { DatabaseServiceProvider } from '../../database/database.service';
import { CannotFindError } from '../../../repositories/repositoryErrors.model';
import { Error } from '@prisma/client';

describe('ErrorsService', () => {
    let error: Error;
    let errorsService: ErrorsServiceProvider;
    let errorsRepository: { Dao: DeepMocked<ErrorsRepositoryProvider['Dao']> };
    let db: { Prisma: { error: DeepMocked<DatabaseServiceProvider['Prisma']['error']> } };

    beforeEach(async () => {
        error = getErrorStub();
        const errorsDaoMock = createMock<ErrorsRepositoryProvider['Dao']>();
        const prismaErrorMock = createMock<DatabaseServiceProvider['Prisma']['error']>();
        const module = await Test.createTestingModule({
            providers: [
                ErrorsServiceProvider,
                {
                    provide: ErrorsRepositoryProvider,
                    useValue: {
                        get Dao() {
                            return errorsDaoMock;
                        },
                    },
                },
                {
                    provide: DatabaseServiceProvider,
                    useValue: {
                        get Prisma() {
                            return { error: prismaErrorMock };
                        },
                    },
                },
            ],
        }).compile();
        errorsService = module.get(ErrorsServiceProvider);
        errorsRepository = module.get(ErrorsRepositoryProvider);
        db = module.get(DatabaseServiceProvider);
    });

    it('should be defined service and repository', () => {
        expect(errorsService).toBeDefined();
        expect(errorsRepository).toBeDefined();
    });

    describe('handleError', () => {
        it('should return Error on success', async () => {
            db.Prisma.error.create.mockResolvedValueOnce(error);

            const result = await errorsService.handleError(new BaseError(error.error));

            expect(isError(result)).toBeFalsy();
            expect(result).toEqual({ uuid: error.uuid });
        });
    });

    describe('getErrorByUuid', () => {
        it('should return CannotFindError error', async () => {
            errorsRepository.Dao.findFirst.mockResolvedValueOnce(null);

            const result = await errorsService.getErrorByUuid({ uuid: '' });

            expect(isError(result)).toBeTruthy();
            expect(result).toBeInstanceOf(CannotFindError);
        });

        it('should return Error on success', async () => {
            errorsRepository.Dao.findFirst.mockResolvedValueOnce(error);

            const result = await errorsService.getErrorByUuid({ uuid: '' });

            expect(isError(result)).toBeFalsy();
            expect(result).toEqual(error);
        });
    });
});
