import { RepositoryModule } from '@lib/repository';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EnvConfig } from '../../config/config.model';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtUserRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtUserStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        RepositoryModule,
        UserModule,
        JwtModule.registerAsync({
            inject: [EnvConfig],
            useFactory: (config: EnvConfig) => ({
                secret: config.JWT_SECRET,
                signOptions: { expiresIn: config.JWT_EXPIRES_IN },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtUserStrategy, JwtUserRefreshStrategy],
    exports: [AuthService],
})
export class AuthModule {}
