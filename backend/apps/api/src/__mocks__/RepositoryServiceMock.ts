import { createMock } from '@golevelup/ts-jest';
import { UserEntity } from '@lib/repository/entities/user.entity';
import { Repository } from 'typeorm';

export const getRepositoryServiceMock = () => {
    return {
        user: createMock<Repository<UserEntity>>(),
    };
};
