import { CoreConfigService, UserNotFound, isError } from '@lib/core';
import { RepositoryService } from '@lib/repository';
import { UserEntity } from '@lib/repository/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SHA256 } from 'crypto-js';
import { v4 } from 'uuid';
import { ConfigModel } from '../../config/config.model';
import { UserService } from '../user/user.service';
import { SignInBody, SignUpBody } from './common/auth.dto';
import {
    CannotFindEmailConfirm,
    EmailAlreadyConfirmed,
    EmailNotConfirmed,
    EmailOrPasswordIncorrect,
} from './common/auth.errors';
import { GetTokenResult } from './common/auth.model';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwt: JwtService,
        private readonly rep: RepositoryService,
        private readonly config: CoreConfigService<ConfigModel>,
        private readonly user: UserService,
    ) {}

    async signUp(body: SignUpBody) {
        const user = await this.user.createUser(body.email, body.password);
        if (isError(user)) {
            return user;
        }

        const sendEmailResult = await this.sendConfirmEmail(user);
        if (isError(sendEmailResult)) {
            return sendEmailResult;
        }
    }

    async signIn(body: SignInBody): Promise<GetTokenResult | EmailOrPasswordIncorrect | EmailNotConfirmed> {
        const hash = SHA256(body.password).toString();
        const user = await this.rep.user.findOne({ where: { email: body.email, hash } });

        if (!user) {
            return new EmailOrPasswordIncorrect(body.email);
        }

        if (!user.emailConfirmed) {
            return new EmailNotConfirmed(body.email);
        }

        const { accessToken, refreshToken, refreshTokenHash } = this.generateToken(user.id);
        await this.rep.user.save({ id: user.id, refreshTokenHash });

        return {
            token: accessToken,
            refreshCookie:
                `Refresh=${refreshToken}; HttpOnly; ` + `Path=/; Max-Age=${this.config.env.JWT_REFRESH_EXPIRES_IN}`,
        };
    }

    async signOut(id: number) {
        const user = await this.rep.user.findOne({ where: { id } });
        if (user) {
            user.refreshTokenHash = null;
            await this.rep.user.save(user);
        }
    }

    async refresh(id: number): Promise<GetTokenResult | UserNotFound> {
        const user = await this.rep.user.findOne({ where: { id } });
        if (!user) {
            return new UserNotFound({ userId: id });
        }

        const { accessToken, refreshToken, refreshTokenHash } = this.generateToken(id);
        user.refreshTokenHash = refreshTokenHash;
        await this.rep.user.save(user);

        return {
            token: accessToken,
            refreshCookie:
                `Refresh=${refreshToken}; HttpOnly; ` + `Path=/; Max-Age=${this.config.env.JWT_REFRESH_EXPIRES_IN}`,
        };
    }

    async confirmEmail(token: string) {
        const user = await this.rep.user.findOne({ where: { emailConfirmed: false, emailConfirmToken: token } });
        if (user === null) {
            return new CannotFindEmailConfirm();
        }

        user.emailConfirmed = true;

        const { accessToken, refreshToken, refreshTokenHash } = this.generateToken(user.id);
        user.refreshTokenHash = refreshTokenHash;
        await this.rep.user.save(user);

        return {
            token: accessToken,
            refreshCookie:
                `Refresh=${refreshToken}; HttpOnly; ` + `Path=/; Max-Age=${this.config.env.JWT_REFRESH_EXPIRES_IN}`,
        };
    }

    async sendConfirmEmail(user: UserEntity) {
        if (user.emailConfirmed) {
            return new EmailAlreadyConfirmed(user.id);
        }

        const token = v4();
        user.emailConfirmToken = token;
        await this.rep.user.save(user);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const link = `${this.config.env.DOMAIN}/auth/confirm-email?token=${token}`;
        // await this.mailService.sendEmail(
        //     'Please confirm email',
        //     `<a href="${link}">${link}</a>`,
        //     userResult.email,
        // );  FIXME: Need mail service implementation
    }

    private generateToken(id: number) {
        const refreshToken = this.jwt.sign(
            { id, date: Date.now() },
            {
                secret: this.config.env.JWT_REFRESH_SECRET,
                expiresIn: this.config.env.JWT_REFRESH_EXPIRES_IN,
            },
        );

        const refreshTokenHash = SHA256(refreshToken).toString();

        return {
            refreshToken,
            refreshTokenHash,
            accessToken: this.jwt.sign(
                { id, date: Date.now() },
                {
                    secret: this.config.env.JWT_SECRET,
                    expiresIn: this.config.env.JWT_EXPIRES_IN,
                },
            ),
        };
    }
}
