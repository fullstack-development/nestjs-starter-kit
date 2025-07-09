import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { EnvConfig } from 'apps/api/src/config/config.model';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../common/auth.model';

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user-guard') {
    constructor(private config: EnvConfig) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.JWT_SECRET,
        });
    }

    async validate({ id }: TokenPayload) {
        return { id };
    }
}
