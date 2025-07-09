export type Log = {
    level: 'log' | 'error' | 'warn' | 'http_exception';
    payload: any;
    serviceName: string;
    time: Date;
};
