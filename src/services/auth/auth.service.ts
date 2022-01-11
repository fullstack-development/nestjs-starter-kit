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
import { UserEntity } from '../../repositories/users/user.entity';
import {
    UsersRepository,
    UsersRepositoryProvider,
} from '../../repositories/users/users.repository';
import { uuid } from '../../utils';
import { ConfigService, ConfigServiceProvider } from '../config/config.service';
import { MailService, MailServiceProvider } from '../mail/mail.service';
import { UserService, UserServiceProvider } from '../user/user.service';
import {
    CannotCreateEmailConfirmation,
    CannotCreateRefreshToken,
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
        private userRepository: UsersRepositoryProvider,
        private emailConfirmsRepository: EmailConfirmsRepositoryProvider,
        private jwtService: JwtService,
        private configService: ConfigServiceProvider,
        private refreshTokensRepository: RefreshTokensRepositoryProvider,
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

        return this.generateTokensWithCookie(userResult.id, userResult.email);
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

        return this.generateTokensWithCookie(userResult.id, userResult.email);
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
        // await this.mailService.sendEmail(
        //     'Please confirm email',
        //     `<a href="${link}">${link}</a>`,
        //     userResult.email,
        // );  FIXME: Need mail service implemantation
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

        const user = await this.userRepository.findOneRelations({
            where: { id },
            relations: ['refreshToken'],
        });

        if (isError(user)) {
            return user;
        }

        if (user.refreshToken) {
            const updatedRefreshToken = await this.refreshTokensRepository.updateOne(
                {
                    tokenHash: user.refreshToken.tokenHash,
                },
                { tokenHash: hashedRefreshToken },
            );

            if (isError(updatedRefreshToken)) {
                return updatedRefreshToken;
            }
        } else {
            const createdRefreshToken = await this.refreshTokensRepository.create({
                tokenHash: hashedRefreshToken,
                user,
            });

            if (!createdRefreshToken) {
                return new CannotCreateRefreshToken({ email });
            }
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
        UsersRepository,
        UserService,
        EmailConfirmsRepository,
        MailService,
        RefreshTokensRepository,
        UsersRepository,
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
