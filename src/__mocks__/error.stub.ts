import { Error } from '@prisma/client';

export const getErrorStub = (): Error => {
    return {
        id: 0,
        uuid: 'test uuid',
        error: 'test error',
        userId: 1,
        stack: '',
        message: '',
        payload: '',
    };
};
