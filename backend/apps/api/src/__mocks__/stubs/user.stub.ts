import { UserEntity } from '@lib/repository/entities/user.entity';

export const getPartialUserStub = (): Omit<UserEntity, 'balance'> => ({
    id: 0,
    email: 'email@example.com',
    createdAt: new Date(),
    hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // password
    emailConfirmed: false,
    refreshTokenHash: undefined,
    emailConfirmToken: undefined,
});
