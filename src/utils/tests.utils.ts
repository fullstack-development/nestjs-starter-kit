import { JwtAuthenticationGuardUser } from './../services/auth/jwt-authentication.guard';
import * as request from 'supertest';
import { INestApplication, Type } from '@nestjs/common';

type CheckSecureEndpointOptions = {
    controller: Type<unknown>;
    url: string;
    methodName: string;
    guard?: Type<unknown>;
    appWrap: AppWrap;
};

export type AppWrap = { app: INestApplication };

export const checkSecureEndpoint = (options: CheckSecureEndpointOptions) => {
    const {
        guard: staticGuard = JwtAuthenticationGuardUser,
        controller,
        methodName,
        url,
        appWrap,
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
};
