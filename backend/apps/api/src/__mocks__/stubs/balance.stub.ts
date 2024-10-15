import { BalanceEntity } from '@lib/repository';

export const getPartialBalanceStub = (): Omit<BalanceEntity, 'user'> => ({
    id: 0,
    cash: 0,
});
