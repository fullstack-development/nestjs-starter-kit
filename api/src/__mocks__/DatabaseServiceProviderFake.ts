/* eslint-disable @typescript-eslint/no-explicit-any */

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { DatabaseServiceProvider } from '../services/database/database.service';

export type DeepMockedDatabaseServiceProvider = ReturnType<typeof getMockedDatabase>;

export function getMockedDatabase() {
    const db = {
        Prisma: createMock<DatabaseServiceProvider['Prisma']>(),
    };
    (db.Prisma as any)['user'] = createMock();
    (db.Prisma as any)['emailConfirm'] = createMock();
    (db.Prisma as any)['refreshToken'] = createMock();

    return db as unknown as DeepMocked<DatabaseServiceProvider> & {
        Prisma: DeepMocked<DatabaseServiceProvider['Prisma']> & {
            user: DeepMocked<DatabaseServiceProvider['Prisma']['user']>;
            refreshToken: DeepMocked<DatabaseServiceProvider['Prisma']['refreshToken']>;
        };
    };
}
