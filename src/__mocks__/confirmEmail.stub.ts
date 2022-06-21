import { EmailConfirm } from '@prisma/client';

export const getConfirmEmailStub = (): EmailConfirm => {
    return {
        id: 0,
        confirmUuid: 'test uuid',
        userId: 0,
    };
};
