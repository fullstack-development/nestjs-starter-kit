import { Inject, Injectable } from '@nestjs/common';
import { Log } from '../../model';
import { OpenobserveModuleOptions } from './openobserve.model';

@Injectable()
export class OpenobserveService {
    constructor(@Inject('OPENOBSERVE_CONFIG') private readonly config: OpenobserveModuleOptions) {}

    public log(log: Log) {
        return fetch(`${this.config.endpoint}/api/${this.config.organizationId}/${this.config.appId}/_json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${btoa(`${this.config.user}:${this.config.key}`)}`,
            },
            body: JSON.stringify({
                ...log,
                container: process.env.HOSTNAME,
            }),
        });
    }
}
