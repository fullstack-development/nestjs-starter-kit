import { BaseError, isError } from '../src';

export type Nullable<T> = { [P in keyof T]: T[P] | null };

export type FirstArgument<T> = T extends (first: infer F, ...args: Array<unknown>) => unknown
    ? F
    : never;

type ObjectEntry<T extends Record<string, unknown>> = T extends Record<string, unknown>
    ? { [K in keyof T]: [K, Required<T>[K]] }[keyof T] extends infer E
        ? E extends [infer K, infer V]
            ? K extends string | number
                ? [`${K}`, V]
                : never
            : never
        : never
    : never;

export type Entry<T extends Record<string, unknown>> = T extends Record<string, unknown>
    ? ObjectEntry<T>
    : never;

export function entries<T extends Record<string, unknown>>(object: T): ReadonlyArray<Entry<T>> {
    return Object.entries(object) as unknown as ReadonlyArray<Entry<T>>;
}

export type WithoutError<T> = T extends BaseError<unknown> ? never : T;
