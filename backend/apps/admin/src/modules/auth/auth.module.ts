import { CoreConfigService } from '@lib/core';
import { RepositoryModule } from '@lib/repository';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModel } from '../../config/config.model';
import { ConfigModule } from '../../config/config.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        ConfigModule,
        RepositoryModule,
        JwtModule.registerAsync({
            inject: [CoreConfigService],
            useFactory: (configService: CoreConfigService<ConfigModel>) => ({
                secret: configService.env.JWT_SECRET,
                signOptions: { expiresIn: configService.env.JWT_EXPIRES_IN },
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
