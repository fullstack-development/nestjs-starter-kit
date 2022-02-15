import { ExtractJwt, Strategy } from 'passport-jwt';

import { PassportStrategy } from '@nestjs/passport';

import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { sha256 } from '../../../utils/crypt.utils';
import { UsersRepositoryProvider } from '../../../repositories/users/users.repository';
import { ConfigServiceProvider } from '../../config/config.service';
import { TokenPayload } from '../auth.model';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(
        private readonly userRepository: UsersRepositoryProvider,

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
        const user = await this.userRepository.getNativeRepository().findOne({
            where: { email },
            relations: ['refreshToken'],
        });

        const refreshToken = user?.refreshToken?.tokenHash;

        const token: string | undefined = request.cookies?.Refresh;

        if (user && refreshToken && token && sha256(token) === refreshToken) {
            return user;
        }
    }
}
