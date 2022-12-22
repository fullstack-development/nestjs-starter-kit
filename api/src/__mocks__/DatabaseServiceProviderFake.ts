/* eslint-disable @typescript-eslint/no-explicit-any */

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { DatabaseProvider } from '../core/database/database.core';

export type DeepMockedDatabaseServiceProvider = ReturnType<typeof getMockedDatabase>;

export function getMockedDatabase() {
    const db = {
        Prisma: createMock<DatabaseProvider['Prisma']>(),
    };
    (db.Prisma as any)['user'] = createMock();
    (db.Prisma as any)['emailConfirm'] = createMock();
    (db.Prisma as any)['refreshToken'] = createMock();

    return db as unknown as DeepMocked<DatabaseProvider> & {
        Prisma: DeepMocked<DatabaseProvider['Prisma']> & {
            user: DeepMocked<DatabaseProvider['Prisma']['user']>;
            refreshToken: DeepMocked<DatabaseProvider['Prisma']['refreshToken']>;
        };
    };
}
