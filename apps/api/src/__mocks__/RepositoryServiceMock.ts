import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { RepositoryService } from '@lib/repository';
import { UserEntity } from '@lib/repository/entities/user.entity';
import { Repository } from 'typeorm';

export const getRepositoryServiceMock = () => {
    return {
        user: createMock<Repository<UserEntity>>(),
    } as unknown as DeepMocked<RepositoryService>;
};
