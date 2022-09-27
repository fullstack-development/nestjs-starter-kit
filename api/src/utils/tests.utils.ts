import * as request from 'supertest';
import { INestApplication, Type } from '@nestjs/common';
import { JwtUserGuard } from '../services/auth/jwt-user.guard';
import { DeepMockedDatabaseServiceProvider } from '../__mocks__/DatabaseServiceProviderFake';
import { getUserStub } from '../__mocks__/user.stub';
import { JwtService } from '@nestjs/jwt';

interface DgGet {
    get get(): DeepMockedDatabaseServiceProvider;
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
        db.get.Prisma.user.findFirst.mockResolvedValueOnce(getUserStub());
        const response = await request(appWrap.app.getHttpServer())
            .get(url)
            .auth(jwtService.get.sign({ email: 'a@a.a' }), { type: 'bearer' });

        expect(response.statusCode).toEqual(200);
        expect(db.get.Prisma.user.findFirst).toBeCalledWith({ where: { email: 'a@a.a' } });
    });
}
