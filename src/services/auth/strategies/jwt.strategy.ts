import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { TokenPayload } from '../auth.model';
import { ConfigServiceProvider } from '../../config/config.service';
import { DatabaseServiceProvider } from '../../database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-user') {
    constructor(private db: DatabaseServiceProvider, private configService: ConfigServiceProvider) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.JWT_SECRET,
        });
    }

    async validate({ email }: TokenPayload) {
        return await this.db.Prisma.user.findFirst({ where: { email } });
    }
}
