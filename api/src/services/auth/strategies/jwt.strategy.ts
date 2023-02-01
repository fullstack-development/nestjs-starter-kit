import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as R from 'ramda';
import { ConfigProvider } from '../../../core/config/config.core';
import { DatabaseProvider } from '../../../core/database/database.core';
import { TokenPayload } from '../auth.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-user') {
    constructor(private db: DatabaseProvider, private config: ConfigProvider) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.JWT_SECRET,
        });
    }

    async validate({ email }: TokenPayload) {
        return R.pick(
            ['id', 'email'],
            await this.db.UnsafeRepository.user.findFirst({ where: { email } }),
        );
    }
}
