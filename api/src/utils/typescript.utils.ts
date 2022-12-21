export type Nullable<T> = { [P in keyof T]: T[P] | null };

export type FirstArgument<T> = T extends (first: infer F, ...args: Array<unknown>) => unknown
    ? F
    : never;
