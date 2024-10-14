import { RepositoryModule } from '@lib/repository';
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ConfigModule } from './config/config.module';

@Module({
    imports: [ConfigModule, RepositoryModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}
