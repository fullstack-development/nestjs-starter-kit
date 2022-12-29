import { RefreshToken, User } from '@lib/repository';
import { Injectable, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Config, ConfigProvider } from '../../core/config/config.core';
import { Database, DatabaseProvider } from '../../core/database/database.core';
import { isError } from '../../core/errors.core';
import { sha256 } from '../../utils/crypt.utils';
import { UserService, UserServiceProvider } from '../user/user.service';
import { UserType } from './token.model';

@Injectable()
export class TokenServiceProvider {
    constructor(
        private readonly config: ConfigProvider,
        private readonly jwt: JwtService,
        private readonly users: UserServiceProvider,
        private readonly db: DatabaseProvider,
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
                        expiresIn: this.config.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
                        secret: this.config.JWT_REFRESH_TOKEN_SECRET,
                    },
                    token: {
                        expiresIn: this.config.JWT_EXPIRES_IN,
                        secret: this.config.JWT_SECRET,
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
            await this.db.refreshToken.update({
                where: {
                    id: user.refreshToken.id,
                },
                data: { hash: hashedRefreshToken },
            });
        } else {
            await this.db.refreshToken.create({
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
        Config,
        Database,
        JwtModule.registerAsync({
            imports: [Config],
            inject: [ConfigProvider],
            useFactory: (configService: ConfigProvider) => ({
                secret: configService.JWT_SECRET,
                signOptions: { expiresIn: configService.JWT_EXPIRES_IN },
            }),
        }),
        UserService,
    ],
    providers: [TokenServiceProvider],
    exports: [TokenServiceProvider],
})
export class TokenService {}
