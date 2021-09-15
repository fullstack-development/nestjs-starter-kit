import { Injectable, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { resultFail, resultSuccess } from '../../model/result.model';
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
    cannotCreateEmailConfirmation,
    cannotSendEmailConfirmation,
    confirmationNotFound,
    emailNotConfirmed,
    emailAlreadyConfirmed,
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
        if (!userResult.success) {
            return userResult;
        }
        const user = userResult.data;

        const sendEmailResult = await this.sendConfirmEmail({ id: user.id });
        if (!sendEmailResult.success) {
            return resultFail(cannotSendEmailConfirmation({ sourceError: sendEmailResult.error }));
        }

        return resultSuccess();
    }

    async signIn(payload: UserPayload) {
        const userResult = await this.userService.findVerifiedUser(payload);
        if (!userResult.success) {
            return userResult;
        }
        const user = userResult.data;

        if (!user.emailConfirmed) {
            return resultFail(emailNotConfirmed());
        }

        return resultSuccess({ token: this.jwtService.sign({ email: payload.email }) });
    }

    async confirmEmail(confirmId: string) {
        const confirmEntityResult = await this.emailConfirmsRepository.findOne({ confirmId });
        if (!confirmEntityResult.success) {
            return resultFail(confirmationNotFound());
        }
        const confirmEntity = confirmEntityResult.data;

        const userResult = await this.userService.findUser({ id: confirmEntity.userId });
        if (!userResult.success) {
            return userResult;
        }
        const user = userResult.data;

        if (user.emailConfirmed) {
            return resultFail(emailAlreadyConfirmed());
        }

        const confirmedResult = await this.userService.confirmEmail({ id: user.id });
        if (!confirmedResult.success) {
            return confirmedResult;
        }

        return resultSuccess({
            token: this.jwtService.sign({ email: user.email }),
        });
    }

    async sendConfirmEmail(filter: Pick<UserEntity, 'id'>) {
        const userResult = await this.userService.findUser(filter);
        if (!userResult.success) {
            return userResult;
        }
        const user = userResult.data;

        if (user.emailConfirmed) {
            return resultFail(emailAlreadyConfirmed());
        }

        const confirmEntityId = await this.emailConfirmsRepository.create({
            userId: user.id,
            confirmId: uuid(),
        });
        const confirmEntityResult = await this.emailConfirmsRepository.findOne({
            id: confirmEntityId,
        });
        if (!confirmEntityResult.success) {
            return resultFail(
                cannotCreateEmailConfirmation({
                    id: filter.id,
                    createdConfirmId: confirmEntityId,
                }),
            );
        }
        const confirmEntity = confirmEntityResult.data;
        const link = `${this.configService.DOMAIN}/auth/confirm-email?uuid=${confirmEntity.confirmId}`;
        await this.mailService.sendEmail(
            'Please confirm email',
            `<a href="${link}">${link}</a>`,
            userResult.data.email,
        );
        return resultSuccess();
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
