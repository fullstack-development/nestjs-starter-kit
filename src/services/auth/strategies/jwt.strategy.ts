import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { TokenPayload } from '../auth.model';
import { ConfigServiceProvider } from '../../config/config.service';
import { UsersRepositoryProvider } from '../../../repositories/users/users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-user') {
    constructor(
        private readonly usersRepository: UsersRepositoryProvider,
        private readonly configService: ConfigServiceProvider,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.JWT_SECRET,
        });
    }

    async validate({ email }: TokenPayload) {
        const user = await this.usersRepository.findOne({ email });

        if (!user || user.isBanned) {
            return undefined;
        }

        return user;
    }
}
