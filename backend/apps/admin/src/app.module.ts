import { RepositoryModule } from '@lib/repository';
import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { DbModule } from './modules/db/db.module';

@Module({
    imports: [ConfigModule, RepositoryModule, AuthModule, DbModule],
})
export class AppModule {}
