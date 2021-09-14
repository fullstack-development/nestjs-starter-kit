import { Injectable, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { resultFail, resultSuccess } from '../../model/result.model';
import {
    EmailConfirmsRepository,
    EmailConfirmsRepositoryProvider,
} from '../../repositories/emailConfirms/emailConfirms.repository';
import { UserEntity } from '../../repositories/users/user.entity';
import { uuid } from '../../utils';
import { ConfigService, ConfigServiceProvider } from '../config/config.service';
import { UserService, UserServiceProvider } from '../user/user.service';
import {
    ConfirmationNotFound,
    EmailAlreadyConfirmed,
    EmailNotConfirmed,
    UnknownUserPayload,
} from './auth.model';
import { JwtStrategy } from './strategies/jwt.strategy';

@Injectable()
export class AuthServiceProvider {
    constructor(
        private userService: UserServiceProvider,
        private emailConfirmsRepository: EmailConfirmsRepositoryProvider,
        private jwtService: JwtService,
    ) {}

    signUp = async (payload: UnknownUserPayload) => {
        const user = await this.userService.createUser(payload);
        if (user.success) {
            await this.sendConfirmEmail({ id: user.data.id });
        }
        return user;
    };

    logIn = async (payload: UnknownUserPayload) => {
        const user = await this.userService.findVerifiedUser(payload);
        if (!user.success) {
            return user;
        }

        if (!user.data.emailConfirmed) {
            return resultFail(new EmailNotConfirmed());
        }

        return resultSuccess({ token: this.jwtService.sign({ email: payload.email }) });
    };

    confirmEmail = async (confirmId: string) => {
        const confirmEntity = await this.emailConfirmsRepository.findOne({ confirmId });
        if (confirmEntity === null) {
            return resultFail(new ConfirmationNotFound());
        }

        const user = await this.userService.findUser({ id: confirmEntity.userId });
        if (!user.success) {
            return user;
        }

        if (user.data.emailConfirmed) {
            return resultFail(new EmailAlreadyConfirmed());
        }

        const confirmedResult = await this.userService.confirmEmail({ id: user.data.id });
        if (!confirmedResult.success) {
            return confirmedResult;
        }

        return resultSuccess({
            token: this.jwtService.sign({ email: user.data.email }),
        });
    };

    sendConfirmEmail = async (filter: Partial<UserEntity>) => {
        const user = await this.userService.findUser(filter);
        if (!user.success) {
            return user;
        }

        if (user.data.emailConfirmed) {
            return resultFail(new EmailAlreadyConfirmed());
        }

        const confirmEntityId = await this.emailConfirmsRepository.create({
            userId: user.data.id,
            confirmId: uuid(),
        });
        const confirmEntity = await this.emailConfirmsRepository.findOne({ id: confirmEntityId });
        if (confirmEntity === null) {
            return resultFail();
        }
        const link = `${this.domain}/auth/confirm-email?uuid=${confirmId}`;
        await this.mailService.sendEmail(
            'Please confirm email',
            `<a href="${link}">${link}</a>`,
            userResult.data.email,
        );
        return resultSuccess();
    };
}

@Module({
    imports: [
        ConfigService,
        UserService,
        EmailConfirmsRepository,
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
