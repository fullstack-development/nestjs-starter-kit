import { TokenService, TokenServiceProvider } from './../token/token.service';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { sha256 } from '../../utils/crypt.utils';
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
import { UserType } from '../token/token.model';

@Injectable()
export class AuthServiceProvider {
    constructor(
        private userService: UserServiceProvider,
        private emailConfirms: EmailConfirmsRepositoryProvider,
        private configService: ConfigServiceProvider,
        private refreshTokens: RefreshTokensRepositoryProvider,
        private mailService: MailServiceProvider,
        private tokenService: TokenServiceProvider,
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

        return this.tokenService.generate(userResult.id, UserType.USER, userResult.email);
    }

    async signOut(email: string) {
        const user = await this.userService.findUser({ email });
        if (!isError(user)) {
            await this.refreshTokens.Dao.delete({ where: { userId: user.id } });
        }
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

        return this.tokenService.generate(userResult.id, UserType.USER, userResult.email);
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
}

@Module({
    imports: [
        ConfigService,
        DatabaseService,
        UserService,
        EmailConfirmsRepository,
        MailService,
        RefreshTokensRepository,
        TokenService,
    ],
    providers: [AuthServiceProvider, JwtStrategy, JwtRefreshTokenStrategy],
    exports: [AuthServiceProvider],
})
export class AuthService {}
