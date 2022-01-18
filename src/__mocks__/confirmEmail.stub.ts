import { EmailConfirmEntity } from '../repositories/emailConfirms/emailConfirm.entity';

export const getConfirmEmailStub = (): EmailConfirmEntity => {
    return {
        id: 0,
        confirmId: 'test uuid',
        userId: 0,
    };
};
