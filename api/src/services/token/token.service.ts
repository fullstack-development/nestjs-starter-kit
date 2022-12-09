import { Injectable, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RefreshToken, User } from '@prisma/client';
import { isError } from '../../core/errors.core';
import {
    RefreshTokensRepository,
    RefreshTokensRepositoryProvider,
} from '../../repositories/refreshTokens/refreshTokens.repository';
import { sha256 } from '../../utils/crypt.utils';
import { ConfigService, ConfigServiceProvider } from '../config/config.service';
import { UserService, UserServiceProvider } from '../user/user.service';
import { UserType } from './token.model';

@Injectable()
export class TokenServiceProvider {
    constructor(
        private readonly cfg: ConfigServiceProvider,
        private readonly jwt: JwtService,
        private readonly users: UserServiceProvider,
        private readonly usersRefresh: RefreshTokensRepositoryProvider,
    ) {}

    async generate(userId: number, userType: UserType, email: string) {
        const user = await this.users.findUser({ id: userId });
        if (isError(user)) {
            return user;
        }

        const userTypedConfig = this.getUserTypedConfig(userType);
        const refreshToken = this.jwt.sign(
            { email, date: Date.now() },
            {
                secret: userTypedConfig.refresh.secret,
                expiresIn: userTypedConfig.refresh.expiresIn,
            },
        );

        const hashedRefreshToken = sha256(refreshToken);
        await this.processRefreshToken(user, hashedRefreshToken);

        return {
            accessToken: this.jwt.sign(
                { email, date: Date.now() },
                {
                    secret: userTypedConfig.token.secret,
                    expiresIn: userTypedConfig.token.expiresIn,
                },
            ),
            refreshToken,
            refreshCookie:
                `Refresh=${refreshToken}; HttpOnly; ` +
                `Path=/; Max-Age=${userTypedConfig.refresh.expiresIn}`,
        };
    }

    private getUserTypedConfig(userType: UserType) {
        switch (userType) {
            case UserType.USER:
                return {
                    refresh: {
                        expiresIn: this.cfg.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
                        secret: this.cfg.JWT_REFRESH_TOKEN_SECRET,
                    },
                    token: {
                        expiresIn: this.cfg.JWT_EXPIRES_IN,
                        secret: this.cfg.JWT_SECRET,
                    },
                };
        }
    }

    private async processRefreshToken(
        user: User & {
            refreshToken: RefreshToken | null;
        },
        hashedRefreshToken: string,
    ) {
        if (user.refreshToken) {
            await this.usersRefresh.Dao.update({
                where: {
                    id: user.refreshToken.id,
                },
                data: { hash: hashedRefreshToken },
            });
        } else {
            await this.usersRefresh.Dao.create({
                data: {
                    hash: hashedRefreshToken,
                    userId: user.id,
                },
            });
        }
    }
}

@Module({
    imports: [
        ConfigService,
        JwtModule.registerAsync({
            imports: [ConfigService],
            inject: [ConfigServiceProvider],
            useFactory: (configService: ConfigServiceProvider) => ({
                secret: configService.JWT_SECRET,
                signOptions: { expiresIn: configService.JWT_EXPIRES_IN },
            }),
        }),
        UserService,
        RefreshTokensRepository,
    ],
    providers: [TokenServiceProvider],
    exports: [TokenServiceProvider],
})
export class TokenService {}
