import { CoreConfigService } from '@lib/core';
import { RepositoryService } from '@lib/repository';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigModel } from 'apps/api/src/config/config.model';
import { SHA256 } from 'crypto-js';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as R from 'ramda';
import { IsNull, Not } from 'typeorm';
import { TokenPayload } from '../common/auth.model';

@Injectable()
export class JwtUserRefreshStrategy extends PassportStrategy(Strategy, 'jwt-user-refresh-guard') {
    constructor(
        private readonly rep: RepositoryService,
        private config: CoreConfigService<ConfigModel>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => request?.cookies?.Refresh]),
            secretOrKey: config.env.JWT_REFRESH_SECRET,
            passReqToCallback: true,
        });
    }

    async validate(request: Request, { id }: TokenPayload) {
        const admin = await this.rep.user.findOne({ where: { id, refreshTokenHash: Not(IsNull()) } });

        const hash = admin?.refreshTokenHash;
        const token: string | undefined = request.cookies?.Refresh;

        if (admin && hash && token && SHA256(token).toString() === hash) {
            return R.pick(['id'], admin);
        }
    }
}
