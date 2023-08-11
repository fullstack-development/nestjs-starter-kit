import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { INestApplication } from '@nestjs/common';
import { ethers } from 'ethers';
import { DatabaseProvider, Repositories } from '../../repository';

export type DatabaseRepositoriesMock = {
    [key in Repositories]: DeepMocked<DatabaseProvider[key]>;
} & {
    UnsafeRepository: {
        $transaction: jest.Mock;
    };
} & {
    UnsafeRepository: {
        [key in Repositories]: DeepMocked<DatabaseProvider[key]>;
    };
};
export function mockDatabase(): DatabaseRepositoriesMock {
    return {
        UnsafeRepository: {
            $transaction: jest.fn(),
            ...mockDatabaseRepositories(),
        },
        ...mockDatabaseRepositories(),
    } as unknown as DatabaseRepositoriesMock;
}

export function mockDatabaseRepositories() {
    let db = {};
    for (const repositoryName of Object.values(Repositories)) {
        db = {
            ...db,
            [repositoryName]: {
                findFirst: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                count: jest.fn(),
                findOne: jest.fn(),
                createMany: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                upsert: jest.fn(),
                updateMany: jest.fn(),
                deleteMany: jest.fn(),
                delete: jest.fn(),
            },
        };
    }
    return db;
}

export type DatabaseUnsafeRepositoryMock<K extends Repositories> = DeepMocked<
    DatabaseProvider['UnsafeRepository']
> & {
    [key in K]: DeepMocked<DatabaseProvider['UnsafeRepository'][key]>;
};

export function mockDatabaseUnsafeRepository<K extends Repositories>(
    key: K,
): DatabaseUnsafeRepositoryMock<K>;
export function mockDatabaseUnsafeRepository<K1 extends Repositories, K2 extends Repositories>(
    k1: K1,
    k2: K2,
): DatabaseUnsafeRepositoryMock<K1> & DatabaseUnsafeRepositoryMock<K2>;
export function mockDatabaseUnsafeRepository<
    K1 extends Repositories,
    K2 extends Repositories,
    K3 extends Repositories,
>(
    k1: K1,
    k2: K2,
    k3: K3,
): DatabaseUnsafeRepositoryMock<K1> &
    DatabaseUnsafeRepositoryMock<K2> &
    DatabaseUnsafeRepositoryMock<K3>;
export function mockDatabaseUnsafeRepository<K extends Repositories>(...keys: Array<K>) {
    const Prisma = createMock();
    for (const k of keys) {
        Object.defineProperty(Prisma, k, {
            value: createMock(),
        });
    }
    return Prisma;
}

export type AppWrap = { app: INestApplication };

export const getRandomWallet = async (): Promise<{
    wallet: ethers.Wallet;
    address: string;
}> => {
    const wallet = ethers.Wallet.createRandom();

    const address = await wallet.getAddress();

    return { wallet, address };
};
export const describeIf = (condition: boolean) => (condition ? describe : describe.skip);

export const itIf = (condition: boolean) => (condition ? it : it.skip);

export const isTestEnvironment = () => process.env['TEST'] === 'true';
