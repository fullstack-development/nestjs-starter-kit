import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS, ConfigOptions } from './config.model';
import { CoreConfigService } from './config.service';

@Global()
@Module({})
export class CoreConfigModule {
    static register<T>(dto: new () => T): DynamicModule {
        return {
            module: CoreConfigModule,
            providers: [
                {
                    provide: CONFIG_OPTIONS,
                    useValue: { dto } as ConfigOptions<T>,
                },
                CoreConfigService,
            ],
            exports: [CoreConfigService],
        };
    }
}
