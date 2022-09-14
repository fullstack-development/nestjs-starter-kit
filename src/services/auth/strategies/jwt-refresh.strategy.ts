import * as R from 'ramda';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { sha256 } from '../../../utils/crypt.utils';
import { ConfigServiceProvider } from '../../config/config.service';
import { TokenPayload } from '../auth.model';
import { DatabaseServiceProvider } from '../../database/database.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(
        private readonly db: DatabaseServiceProvider,

        private readonly configService: ConfigServiceProvider,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => request?.cookies?.Refresh,
            ]),
            secretOrKey: configService.JWT_REFRESH_TOKEN_SECRET,
            passReqToCallback: true,
        });
    }

    async validate(request: Request, { email }: TokenPayload) {
        const user = await this.db.Prisma.user.findFirst({
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
