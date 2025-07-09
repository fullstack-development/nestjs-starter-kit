import { DynamicModule, Module, Provider } from '@nestjs/common';
import { OpenobserveModuleAsyncOptions, OpenobserveModuleOptions } from './openobserve.model';
import { OpenobserveService } from './openobserve.service';

@Module({})
export class OpenobserveModule {
    public static registerAsync(options: OpenobserveModuleAsyncOptions): DynamicModule {
        const asyncProviders = this.createAsyncProviders(options);

        return {
            module: OpenobserveModule,
            imports: options.imports || [],
            providers: [...asyncProviders, OpenobserveService, ...(options.extraProviders || [])],
            exports: [OpenobserveService],
        };
    }

    private static createAsyncProviders(options: OpenobserveModuleAsyncOptions): Array<Provider> {
        if (options.useFactory) {
            return [
                {
                    provide: 'OPENOBSERVE_CONFIG',
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
            ];
        }

        if (options.useClass) {
            return [
                {
                    provide: 'OPENOBSERVE_CONFIG',
                    useFactory: async (optionsFactory: OpenobserveModuleOptions) => optionsFactory,
                    inject: [options.useClass],
                },
                {
                    provide: options.useClass,
                    useClass: options.useClass,
                },
            ];
        }

        if (options.useExisting) {
            return [
                {
                    provide: 'OPENOBSERVE_CONFIG',
                    useFactory: async (optionsFactory: OpenobserveModuleOptions) => optionsFactory,
                    inject: [options.useExisting],
                },
            ];
        }

        throw new Error('Invalid async options');
    }
}
