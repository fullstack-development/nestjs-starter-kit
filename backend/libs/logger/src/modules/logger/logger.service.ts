/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { format } from 'date-fns';
import { OpenobserveService } from '../openobserve/openobserve.service';

const red = '\x1b[31m';
const yellow = '\x1b[33m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

@Injectable()
export class LoggerService implements NestLoggerService {
    constructor(private readonly openobserve: OpenobserveService) {}

    log(message: any, serviceName1?: string, serviceName2?: string) {
        this.logToOpenobserve('log', message, serviceName1, serviceName2);
    }

    error(message: any, serviceName1?: string, serviceName2?: string) {
        this.logToOpenobserve('error', message, serviceName1, serviceName2);
    }

    warn(message: any, serviceName1?: string, serviceName2?: string) {
        this.logToOpenobserve('warn', message, serviceName1, serviceName2);
    }

    private logToOpenobserve(
        level: 'log' | 'error' | 'warn',
        message: any,
        serviceName1: string | undefined,
        serviceName2: string | undefined,
    ) {
        const serviceName = serviceName1 || serviceName2 || 'unknown';
        const time = new Date();
        this.openobserve
            .log({
                level,
                payload: { message },
                serviceName,
                time,
            })
            .finally(() => this.coloredLog(level, serviceName, message, time));
    }

    private coloredLog(level: 'log' | 'error' | 'warn', serviceName: string, message: any, time: Date) {
        const payload = typeof message === 'object' ? JSON.stringify(message) : String(message);

        // eslint-disable-next-line no-console
        console.log(
            format(time, 'yyyy-MM-dd, HH:mm:ss.SSS'),
            green,
            `[${serviceName}]`,
            level === 'error' ? red : level === 'warn' ? yellow : reset,
            payload,
            reset,
        );
    }
}
