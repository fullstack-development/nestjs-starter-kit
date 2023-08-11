import { DatabaseProvider } from '@lib/repository';
import { sha256 } from '@lib/utils';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as R from 'ramda';
import { ConfigProvider } from '../../../core/config/config.core';
import { TokenPayload } from '../auth.model';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-user-refresh') {
    constructor(
        private readonly db: DatabaseProvider,

        private readonly config: ConfigProvider,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => request?.cookies?.Refresh,
            ]),
            secretOrKey: config.JWT_REFRESH_TOKEN_SECRET,
            passReqToCallback: true,
        });
    }

    async validate(request: Request, { email }: TokenPayload) {
        const user = await this.db.UnsafeRepository.user.findFirst({
            where: { email },
            include: { refreshToken: true },
        });

        const refreshToken = user?.refreshToken?.hash;
        const token: string | undefined = request.cookies?.Refresh;

        if (user && refreshToken && token && sha256(token) === refreshToken) {
            return R.pick(['id', 'email'], user);
        }
    }
}
