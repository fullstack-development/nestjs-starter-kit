export const std = {
    log: (data: string) => console.log(data),
    info: (header: string, body = '') => console.info(`\x1b[36m%s\x1b[0m${body}`, header),
    error: (header: string, body = '') => console.error(`\x1b[31m%s\x1b[0m${body}`, header),
};
