import { CoreConfigService } from '@lib/core';
import { AdminEntity, RepositoryService } from '@lib/repository';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { ConfigModel } from '../../config/config.model';
import { EmailOrPasswordIncorrect } from './auth.errors';
import { SignInBody } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly rep: RepositoryService,
        private readonly config: CoreConfigService<ConfigModel>,
        private readonly jwt: JwtService,
    ) {}

    public async signIn(payload: SignInBody) {
        const admin = await this.rep.admin.findOne({ where: { email: payload.email } });
        if (!admin || createHash('sha256').update(payload.password).digest('hex') !== admin.hash) {
            return new EmailOrPasswordIncorrect();
        }

        return await this.generate(admin, payload.email);
    }

    private async generate(admin: AdminEntity, email: string) {
        await this.rep.user.save(admin);

        return this.jwt.sign(
            { email, date: Date.now() },
            {
                secret: this.config.env.JWT_SECRET,
                expiresIn: this.config.env.JWT_EXPIRES_IN,
            },
        );
    }
}
