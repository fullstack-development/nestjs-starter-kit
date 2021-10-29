import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { TokenPayload } from '../auth.model';
import { ConfigServiceProvider } from '../../config/config.service';
import { UsersRepositoryProvider } from '../../../repositories/users/users.repository';
import { isError } from '../../../core/errors.core';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-user') {
    constructor(
        private usersRepository: UsersRepositoryProvider,
        private configService: ConfigServiceProvider,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.JWT_SECRET,
        });
    }

    async validate({ email }: TokenPayload) {
        const user = await this.usersRepository.findOne({ email });

        if (isError(user)) {
            return undefined;
        }

        return user;
    }
}
