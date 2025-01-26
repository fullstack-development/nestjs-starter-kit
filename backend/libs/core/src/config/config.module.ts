import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypedConfigModule, dotenvLoader } from 'nest-typed-config';

@Global()
@Module({})
export class ConfigModule {
    public static register<T>(dto: new () => T): DynamicModule {
        return {
            module: ConfigModule,
            imports: [
                TypedConfigModule.forRoot({
                    schema: dto,
                    load: process.env.NODE_ENV === 'production' ? () => process.env : dotenvLoader(),
                }),
            ],
        };
    }
}
