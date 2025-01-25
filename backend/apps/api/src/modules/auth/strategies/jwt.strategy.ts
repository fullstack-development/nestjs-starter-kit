import { CoreConfigService } from '@lib/core';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigModel } from 'apps/api/src/config/config.model';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../common/auth.model';

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user-guard') {
    constructor(private config: CoreConfigService<ConfigModel>) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.env.JWT_SECRET,
        });
    }

    async validate({ id }: TokenPayload) {
        return { id };
    }
}
