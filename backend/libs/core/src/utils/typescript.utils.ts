export type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
export type DeepMutable<T> = { -readonly [P in keyof T]: DeepMutable<T[P]> };
