import { User } from '@modules/repository';
import { Injectable, Module } from '@nestjs/common';
import { Config, ConfigProvider } from '../../core/config/config.core';
import { Database, DatabaseProvider } from '../../core/database/database.core';
import { CannotFindEmailConfirm } from '../../core/database/database.model';
import { isError } from '../../core/errors.core';
import { uuid } from '../../utils';
import { MailService, MailServiceProvider } from '../mail/mail.service';
import { UserType } from '../token/token.model';
import { TokenService, TokenServiceProvider } from '../token/token.service';
import { UserService, UserServiceProvider } from '../user/user.service';
import {
    CannotSendEmailConfirmation,
    EmailAlreadyConfirmed,
    EmailNotConfirmed,
    UserPayload,
} from './auth.model';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Injectable()
export class AuthServiceProvider {
    constructor(
        private config: ConfigProvider,
        private userService: UserServiceProvider,
        private mailService: MailServiceProvider,
        private tokenService: TokenServiceProvider,
        private db: DatabaseProvider,
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
            await this.db.refreshToken.delete({ where: { userId: user.id } });
        }
    }

    async confirmEmail(confirmUuid: string) {
        const confirmEntityResult = await this.db.emailConfirm.findFirst({
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

        const confirm = await this.db.emailConfirm.create({
            data: {
                userId: userResult.id,
                confirmUuid: uuid(),
            },
        });
        const link = `${this.config.DOMAIN}/auth/confirm-email?uuid=${confirm.confirmUuid}`;
        // await this.mailService.sendEmail(
        //     'Please confirm email',
        //     `<a href="${link}">${link}</a>`,
        //     userResult.email,
        // );  FIXME: Need mail service implementation
    }
}

@Module({
    imports: [Config, Database, UserService, MailService, TokenService],
    providers: [AuthServiceProvider, JwtStrategy, JwtRefreshTokenStrategy],
    exports: [AuthServiceProvider],
})
export class AuthService {}
