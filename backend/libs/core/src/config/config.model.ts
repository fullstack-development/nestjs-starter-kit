export type ConfigOptions<T> = {
    dto: new () => T;
};

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
