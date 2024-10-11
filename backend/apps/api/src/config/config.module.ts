import { CoreConfigModule } from '@lib/core';
import { Module } from '@nestjs/common';
import { ConfigModel } from './config.model';

@Module({
    imports: [CoreConfigModule.register(ConfigModel)],
})
export class ConfigModule {}
