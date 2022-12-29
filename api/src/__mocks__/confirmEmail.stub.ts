import { EmailConfirm } from '@lib/repository';

export function getConfirmEmailStub(): EmailConfirm {
    return {
        id: 0,
        confirmUuid: 'test uuid',
        userId: 0,
    };
}
