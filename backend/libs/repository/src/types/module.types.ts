/* eslint-disable @typescript-eslint/no-explicit-any */

import { ModuleMetadata, Provider, Type } from '@nestjs/common';

export interface RepositoryModuleOptions {
    DB_NAME: string;
    DB_HOST: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_PORT: number;
}

export interface RepositoryModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    name?: string;
    useExisting?: Type<RepositoryModuleOptions>;
    useClass?: Type<RepositoryModuleOptions>;
    useFactory?: (...args: Array<any>) => Promise<RepositoryModuleOptions> | RepositoryModuleOptions;
    inject?: Array<any>;
    extraProviders?: Array<Provider>;
}
