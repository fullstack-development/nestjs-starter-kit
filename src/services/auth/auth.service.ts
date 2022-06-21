import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { sha256 } from './../../utils/crypt.utils';
import { Injectable, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { isError } from '../../core/errors.core';
import {
    EmailConfirmsRepository,
    EmailConfirmsRepositoryProvider,
} from '../../repositories/emailConfirms/emailConfirms.repository';
import {
    RefreshTokensRepository,
    RefreshTokensRepositoryProvider,
} from '../../repositories/refreshTokens/refreshTokens.repository';
import { uuid } from '../../utils';
import { ConfigService, ConfigServiceProvider } from '../config/config.service';
import { MailService, MailServiceProvider } from '../mail/mail.service';
import { UserService, UserServiceProvider } from '../user/user.service';
import {
    CannotSendEmailConfirmation,
    EmailAlreadyConfirmed,
    EmailNotConfirmed,
    UserPayload,
} from './auth.model';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CannotFindEmailConfirm } from '../../repositories/repositoryErrors.model';
import { User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthServiceProvider {
    constructor(
        private userService: UserServiceProvider,
        private emailConfirms: EmailConfirmsRepositoryProvider,
        private jwtService: JwtService,
        private configService: ConfigServiceProvider,
        private refreshTokens: RefreshTokensRepositoryProvider,
        private mailService: MailServiceProvider,
    ) {}

    async signUp(payload: UserPayload) {
        const user = await this.userService.createUser(payload);
        if (isError(user)) {
            return user;
        }

        const sendEmailResult = await this.sendConfirmEmail({ id: user.id });
        if (isError(sendEmailResult)) {
            return new CannotSendEmailConfirmation({
                sourceError: sendEmailResult,
            });
        }
    }

    async signIn(payload: UserPayload) {
        const userResult = await this.userService.findVerifiedUser(payload);
        if (isError(userResult)) {
            return userResult;
        }

        if (!userResult.emailConfirmed) {
            return new EmailNotConfirmed();
        }

        return this.generateTokensWithCookie(userResult.id, userResult.email);
    }

    async confirmEmail(confirmUuid: string) {
        const confirmEntityResult = await this.emailConfirms.Dao.findFirst({
            where: { confirmUuid },
        });
        if (confirmEntityResult === null) {
            return new CannotFindEmailConfirm();
        }

        const userResult = await this.userService.findUser({ id: confirmEntityResult.userId });
        if (isError(userResult)) {
            return userResult;
        }

        if (userResult.emailConfirmed) {
            return new EmailAlreadyConfirmed();
        }

        const confirmedResult = await this.userService.confirmEmail({ id: userResult.id });
        if (isError(confirmedResult)) {
            return confirmedResult;
        }

        return this.generateTokensWithCookie(userResult.id, userResult.email);
    }

    async sendConfirmEmail(where: Pick<User, 'id'>) {
        const userResult = await this.userService.findUser(where);
        if (isError(userResult)) {
            return userResult;
        }

        if (userResult.emailConfirmed) {
            return new EmailAlreadyConfirmed();
        }

        const confirm = await this.emailConfirms.Dao.create({
            data: {
                userId: userResult.id,
                confirmUuid: uuid(),
            },
        });
        const link = `${this.configService.DOMAIN}/auth/confirm-email?uuid=${confirm.confirmUuid}`;
        // await this.mailService.sendEmail(
        //     'Please confirm email',
        //     `<a href="${link}">${link}</a>`,
        //     userResult.email,
        // );  FIXME: Need mail service implementation
    }

    async generateTokens(id: number, email: string) {
        const refreshToken = this.jwtService.sign(
            { email },
            {
                expiresIn: this.configService.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
                secret: this.configService.JWT_REFRESH_TOKEN_SECRET,
            },
        );

        const hashedRefreshToken = sha256(refreshToken);

        const user = await this.userService.findUser({ id });
        if (isError(user)) {
            return user;
        }

        if (user.refreshToken) {
            await this.refreshTokens.Dao.update({
                where: {
                    id: user.refreshToken.id,
                },
                data: { hash: hashedRefreshToken },
            });
        } else {
            await this.refreshTokens.Dao.create({
                data: {
                    hash: hashedRefreshToken,
                    userId: user.id,
                },
            });
        }

        return {
            accessToken: this.jwtService.sign({ email }),
            refreshToken,
        };
    }

    async generateTokensWithCookie(id: number, email: string) {
        const tokens = await this.generateTokens(id, email);

        if (isError(tokens)) {
            return tokens;
        }

        return {
            accessToken: tokens.accessToken,
            // eslint-disable-next-line max-len
            refreshCookie: `Refresh=${tokens.refreshToken}; HttpOnly; Path=/; Max-Age=${this.configService.JWT_REFRESH_TOKEN_EXPIRATION_TIME}`,
        };
    }
}

@Module({
    imports: [
        ConfigService,
        DatabaseService,
        UserService,
        EmailConfirmsRepository,
        MailService,
        RefreshTokensRepository,
        JwtModule.registerAsync({
            imports: [ConfigService],
            inject: [ConfigServiceProvider],
            useFactory: (configService: ConfigServiceProvider) => ({
                secret: configService.JWT_SECRET,
                signOptions: { expiresIn: configService.JWT_EXPIRES_IN },
            }),
        }),
    ],
    providers: [AuthServiceProvider, JwtStrategy, JwtRefreshTokenStrategy],
    exports: [AuthServiceProvider],
})
export class AuthService {}
