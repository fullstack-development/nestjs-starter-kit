import { AdminEntity, BalanceEntity, ItemEntity, UserEntity } from '@lib/repository/entities';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { DbSettings } from './repository.model';
import { RepositoryService } from './repository.service';

export const entities = [UserEntity, BalanceEntity, ItemEntity, AdminEntity];

@Global()
@Module({})
export class RepositoryModule {
    public static register(config: DbSettings): DynamicModule {
        return {
            module: RepositoryModule,
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: config.DB_HOST,
                    port: config.DB_PORT,
                    username: config.DB_USERNAME,
                    password: config.DB_PASSWORD,
                    database: config.DB_NAME,
                    synchronize: false,
                    migrationsTableName: 'migrations',
                    autoLoadEntities: true,
                }),
                TypeOrmModule.forFeature(entities),
                ClsModule.forRoot({
                    plugins: [
                        new ClsPluginTransactional({
                            imports: [TypeOrmModule],
                            adapter: new TransactionalAdapterTypeOrm({
                                dataSourceToken: getDataSourceToken(),
                            }),
                        }),
                    ],
                }),
            ],
            providers: [RepositoryService],
            exports: [RepositoryService],
        };
    }
}
