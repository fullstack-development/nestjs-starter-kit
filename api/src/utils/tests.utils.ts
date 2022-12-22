import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Repositories } from '@modules/repository';
import { INestApplication, Type } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { DatabaseProvider } from '../core/database/database.core';
import { JwtUserGuard } from '../services/auth/guards/jwt-user.guard';
import { getUserStub } from '../__mocks__/user.stub';

export type DatabaseRepositoriesMock = {
    [key in Repositories]: DeepMocked<DatabaseProvider[key]>;
};

export function mockDatabaseRepositories() {
    const db = {};
    for (const repositoryName of Object.values(Repositories)) {
        Object.defineProperty(db, repositoryName, {
            value: createMock(),
        });
    }
    return db as unknown as DatabaseRepositoriesMock;
}

export type DatabasePrismaMock<K extends Repositories> = DeepMocked<DatabaseProvider['Prisma']> & {
    [key in K]: DeepMocked<DatabaseProvider['Prisma'][key]>;
};

export function mockDatabasePrisma<K extends Repositories>(key: K): DatabasePrismaMock<K>;
export function mockDatabasePrisma<K1 extends Repositories, K2 extends Repositories>(
    k1: K1,
    k2: K2,
): DatabasePrismaMock<K1> & DatabasePrismaMock<K2>;
export function mockDatabasePrisma<
    K1 extends Repositories,
    K2 extends Repositories,
    K3 extends Repositories,
>(k1: K1, k2: K2, k3: K3): DatabasePrismaMock<K1> & DatabasePrismaMock<K2> & DatabasePrismaMock<K3>;
export function mockDatabasePrisma<K extends Repositories>(...keys: Array<K>) {
    const Prisma = createMock();
    for (const k of keys) {
        Object.defineProperty(Prisma, k, {
            value: createMock(),
        });
    }
    return Prisma;
}

interface DgGet {
    get get(): { Prisma: DatabasePrismaMock<Repositories.User> };
}

interface JwtServiceGet {
    get get(): JwtService;
}

type CheckSecureEndpointOptions = {
    controller: Type<unknown>;
    url: string;
    methodName: string;
    guard?: Type<unknown>;
    appWrap: AppWrap;
    db: DgGet;
    jwtService: JwtServiceGet;
};

export type AppWrap = { app: INestApplication };

export function checkSecureEndpoint(options: CheckSecureEndpointOptions) {
    const {
        guard: staticGuard = JwtUserGuard,
        controller,
        methodName,
        url,
        appWrap,
        db,
        jwtService,
    } = options;

    it(`should secure by ${staticGuard.name}`, async () => {
        const guards = Reflect.getMetadata('__guards__', controller.prototype[methodName]);
        const guard = new guards[0]();

        expect(guard).toBeInstanceOf(staticGuard);
    });

    it('should return error if not provided token', async () => {
        const response = await request(appWrap.app.getHttpServer()).get(url);

        expect(response.statusCode).toEqual(401);
        expect(response.body).toEqual(expect.objectContaining({ message: 'Unauthorized' }));
    });

    it('should return error if provided invalid token', async () => {
        const response = await request(appWrap.app.getHttpServer())
            .get(url)
            .auth('invalid token', { type: 'bearer' });

        expect(response.statusCode).toEqual(401);
        expect(response.body).toEqual(expect.objectContaining({ message: 'Unauthorized' }));
    });

    it('should properly check auth', async () => {
        const user = getUserStub();
        db.get.Prisma.user.findFirst.mockResolvedValueOnce(user);
        const response = await request(appWrap.app.getHttpServer())
            .get(url)
            .auth(jwtService.get.sign({ id: user.id, email: user.email }), { type: 'bearer' });

        expect(response.statusCode).toEqual(200);
        expect(db.get.Prisma.user.findFirst).toBeCalledWith({ where: { email: user.email } });
    });
}
