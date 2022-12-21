import { EmailConfirm } from '@prisma/client';

export function getConfirmEmailStub(): EmailConfirm {
    return {
        id: 0,
        confirmUuid: 'test uuid',
        userId: 0,
    };
}