import { CoreConfigService } from '@lib/core';
import { RepositoryModule } from '@lib/repository';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModel } from '../../config/config.model';
import { ConfigModule } from '../../config/config.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtUserRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtUserStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        ConfigModule,
        RepositoryModule,
        UserModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [CoreConfigService],
            useFactory: (configService: CoreConfigService<ConfigModel>) => ({
                secret: configService.env.JWT_SECRET,
                signOptions: { expiresIn: configService.env.JWT_EXPIRES_IN },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtUserStrategy, JwtUserRefreshStrategy],
    exports: [AuthService],
})
export class AuthModule {}
