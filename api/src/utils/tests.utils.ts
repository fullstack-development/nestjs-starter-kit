import * as request from 'supertest';
import { INestApplication, Type } from '@nestjs/common';
import { JwtUserGuard } from '../services/auth/guards/jwt-user.guard';
import { getUserStub } from '../__mocks__/user.stub';
import { JwtService } from '@nestjs/jwt';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { DatabaseServiceProvider } from '../services/database/database.service';

type PrismaRepositoryLike = { Dao: unknown };

export type MockRepository<T extends PrismaRepositoryLike> = { Dao: DeepMocked<T['Dao']> };

export const mockRepository = <T extends PrismaRepositoryLike>(): MockRepository<T> => {
    return {
        Dao: createMock<T>(),
    };
};

export type MockDB<K extends keyof DatabaseServiceProvider['Prisma'] = never> = {
    Prisma: DeepMocked<DatabaseServiceProvider['Prisma']> &
        {
            [key in K]: DeepMocked<DatabaseServiceProvider['Prisma'][K]>;
        };
};

export const mockDb = <K extends keyof DatabaseServiceProvider['Prisma']>(keys?: Array<K>) => {
    const db = {
        Prisma: createMock<DatabaseServiceProvider['Prisma']>(),
    };
    if (keys) {
        for (const k of keys) {
            Object.defineProperty(db.Prisma, k, {
                value: createMock<DatabaseServiceProvider['Prisma'][K]>(),
            });
        }
    }
    return db as MockDB<K>;
};

interface DgGet {
    get get(): MockDB<'user'>;
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
