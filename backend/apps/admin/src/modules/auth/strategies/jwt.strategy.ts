import { CoreConfigService } from '@lib/core';
import { RepositoryService } from '@lib/repository';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ContextAdmin } from 'apps/admin/src/app.model';
import { ConfigModel } from 'apps/admin/src/config/config.model';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as R from 'ramda';
import { TokenPayload } from '../auth.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
    constructor(
        private rep: RepositoryService,
        private config: CoreConfigService<ConfigModel>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.env.JWT_SECRET,
        });
    }

    async validate({ email }: TokenPayload): Promise<ContextAdmin | undefined> {
        const admin = await this.rep.admin.findOne({
            where: {
                email,
            },
        });
        if (admin) {
            return R.pick(['id', 'email'], admin);
        }
    }
}
