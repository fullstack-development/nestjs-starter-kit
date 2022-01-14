import { UserEntity } from '../../../../repositories/users/user.entity';

export const getUserStub = (): UserEntity => {
    return {
        id: 0,
        email: 'test@wxample.com',
        hash: 'test hash',
        emailConfirmed: false,
        created: new Date(),
        refreshToken: null,
    };
};
