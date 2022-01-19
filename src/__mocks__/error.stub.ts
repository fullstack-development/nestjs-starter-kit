import { InsertResult } from 'typeorm';
import { ErrorEntity } from '../repositories/errors/errors.entity';

export const getErrorStub = (): ErrorEntity => {
    return {
        uuid: 'test uuid',
        id: 0,
        error: 'test error',
    };
};

export const getInsertResult = (): InsertResult => {
    return { raw: [{ id: 0 }] } as InsertResult;
};
