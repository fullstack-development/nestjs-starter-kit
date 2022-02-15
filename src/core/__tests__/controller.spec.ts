import { CannotFindNewlyCreatedError } from './../../services/errors/errors.model';
import { CR_200_Fail, CR_502 } from './../controller.core';
import { Test } from '@nestjs/testing';
import { processControllerError } from '../controller.core';
import { BasicError } from '../errors.core';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ErrorsServiceProvider } from '../../services/errors/errors.service';

describe('Controller Core', () => {
    let errorsService: DeepMocked<ErrorsServiceProvider>;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                { provide: ErrorsServiceProvider, useValue: createMock<ErrorsServiceProvider>() },
            ],
        }).compile();

        errorsService = module.get(ErrorsServiceProvider);
    });

    it('errors service should be defined', () => {
        expect(errorsService).toBeDefined();
    });

    describe('process contoller error', () => {
        it('should correct handle user errors', async () => {
            const processResult = await processControllerError(
                new BasicError('test error', { userErrorOnly: true }),
                errorsService,
            );

            expect(processResult instanceof CR_200_Fail).toBeTruthy();
        });

        it('should correct handle not user errors', async () => {
            errorsService.handleError.mockResolvedValue({ uuid: 'test uuid' });
            const processResult = await processControllerError(
                new BasicError('test error', { userErrorOnly: false }),
                errorsService,
            );

            expect(processResult instanceof CR_502).toBeTruthy();
        });

        it('should throw error if error not handled', async () => {
            errorsService.handleError.mockResolvedValue(
                new CannotFindNewlyCreatedError(new BasicError('test error')),
            );

            expect(async () =>
                processControllerError(
                    new BasicError('test error', { userErrorOnly: false }),
                    errorsService,
                ),
            ).rejects.toThrow('Cannot find newly created error');
        });
    });
});
