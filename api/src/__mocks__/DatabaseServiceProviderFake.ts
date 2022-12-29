/* eslint-disable @typescript-eslint/no-explicit-any */

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { DatabaseProvider } from '../core/database/database.core';

export type DeepMockedDatabaseServiceProvider = ReturnType<typeof getMockedDatabase>;

export function getMockedDatabase() {
    const db = {
        UnsafeRepository: createMock<DatabaseProvider['UnsafeRepository']>(),
    };
    (db.UnsafeRepository as any)['user'] = createMock();
    (db.UnsafeRepository as any)['emailConfirm'] = createMock();
    (db.UnsafeRepository as any)['refreshToken'] = createMock();

    return db as unknown as DeepMocked<DatabaseProvider> & {
        UnsafeRepository: DeepMocked<DatabaseProvider['UnsafeRepository']> & {
            user: DeepMocked<DatabaseProvider['UnsafeRepository']['user']>;
            refreshToken: DeepMocked<DatabaseProvider['UnsafeRepository']['refreshToken']>;
        };
    };
}
