/* eslint-disable @typescript-eslint/no-explicit-any */

import { ModuleMetadata, Provider, Type } from '@nestjs/common';

export interface OpenobserveModuleOptions {
    endpoint: string;
    key: string;
    organizationId: string;
    appId: string;
    user: string;
}

export interface OpenobserveModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    name?: string;
    useExisting?: Type<OpenobserveModuleOptions>;
    useClass?: Type<OpenobserveModuleOptions>;
    useFactory?: (...args: Array<any>) => Promise<OpenobserveModuleOptions> | OpenobserveModuleOptions;
    inject?: Array<any>;
    extraProviders?: Array<Provider>;
}
