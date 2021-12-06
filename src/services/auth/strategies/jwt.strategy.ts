import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { TokenPayload } from '../auth.model';
import { ConfigServiceProvider } from '../../config/config.service';
import { UsersRepositoryProvider } from '../../../repositories/users/users.repository';

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
        return await this.usersRepository.nativeRepository.findOne({ email });
    }
}
