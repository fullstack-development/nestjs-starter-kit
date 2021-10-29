import { Injectable, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { isError } from '../../core/errors.core';
import {
    EmailConfirmsRepository,
    EmailConfirmsRepositoryProvider,
} from '../../repositories/emailConfirms/emailConfirms.repository';
import { UserEntity } from '../../repositories/users/user.entity';
import { UsersRepository } from '../../repositories/users/users.repository';
import { uuid } from '../../utils';
import { ConfigService, ConfigServiceProvider } from '../config/config.service';
import { MailService, MailServiceProvider } from '../mail/mail.service';
import { UserService, UserServiceProvider } from '../user/user.service';
import {
    AuthToken,
    CannotCreateEmailConfirmation,
    CannotSendEmailConfirmation,
    ConfirmationNotFound,
    EmailAlreadyConfirmed,
    EmailNotConfirmed,
    UserPayload,
} from './auth.model';
import { JwtStrategy } from './strategies/jwt.strategy';

@Injectable()
export class AuthServiceProvider {
    constructor(
        private userService: UserServiceProvider,
        private emailConfirmsRepository: EmailConfirmsRepositoryProvider,
        private jwtService: JwtService,
        private configService: ConfigServiceProvider,
        private mailService: MailServiceProvider,
    ) {}

    async signUp(payload: UserPayload) {
        const userResult = await this.userService.createUser(payload);
        if (isError(userResult)) {
            return userResult;
        }

        const sendEmailResult = await this.sendConfirmEmail({ id: userResult.id });
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

        return new AuthToken(this.jwtService.sign({ email: payload.email }));
    }

    async confirmEmail(confirmId: string) {
        const confirmEntityResult = await this.emailConfirmsRepository.findOne({ confirmId });
        if (isError(confirmEntityResult)) {
            return new ConfirmationNotFound();
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

        return new AuthToken(this.jwtService.sign({ email: userResult.email }));
    }

    async sendConfirmEmail(filter: Pick<UserEntity, 'id'>) {
        const userResult = await this.userService.findUser(filter);
        if (isError(userResult)) {
            return userResult;
        }

        if (userResult.emailConfirmed) {
            return new EmailAlreadyConfirmed();
        }

        const confirmEntityId = await this.emailConfirmsRepository.create({
            userId: userResult.id,
            confirmId: uuid(),
        });
        const confirmEntityResult = await this.emailConfirmsRepository.findOne({
            id: confirmEntityId,
        });
        if (isError(confirmEntityResult)) {
            return new CannotCreateEmailConfirmation({
                id: filter.id,
                createdConfirmId: confirmEntityId,
            });
        }
        const link = `${this.configService.DOMAIN}/auth/confirm-email?uuid=${confirmEntityResult.confirmId}`;
        await this.mailService.sendEmail(
            'Please confirm email',
            `<a href="${link}">${link}</a>`,
            userResult.email,
        );
    }
}

@Module({
    imports: [
        ConfigService,
        UsersRepository,
        UserService,
        EmailConfirmsRepository,
        MailService,
        JwtModule.registerAsync({
            imports: [ConfigService],
            inject: [ConfigServiceProvider],
            useFactory: (configService: ConfigServiceProvider) => ({
                secret: configService.JWT_SECRET,
                signOptions: { expiresIn: configService.JWT_EXPIRES_IN },
            }),
        }),
    ],
    providers: [AuthServiceProvider, JwtStrategy],
    exports: [AuthServiceProvider],
})
export class AuthService {}
