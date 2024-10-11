import { RepositoryModule } from '@lib/repository';
import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { ReactAdminAdapterController } from './react-admin-adapter.controller';
import { ReactAdminAdapterService } from './react-admin-adapter.service';

@Module({
    imports: [ConfigModule, RepositoryModule],
    controllers: [ReactAdminAdapterController],
    providers: [ReactAdminAdapterService],
})
export class ReactAdminAdapterModule {}
