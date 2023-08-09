import { filter } from 'ramda';

const isNotNullOrUndefined = <T>(value: T): value is NonNullable<T> =>
    value !== null && value !== undefined;

export const removeNullableValues = <T>(list: Array<T>): Array<NonNullable<T>> =>
    filter(isNotNullOrUndefined)(list) as Array<NonNullable<T>>;

export const zipThreeArrays = <T, K, V>(
    arr: Array<T>,
    arr1: Array<K>,
    arr2: Array<V>,
): Array<[T, K, V]> => {
    const minLen = Math.min(arr.length, arr1.length, arr2.length);

    const result: Array<[T, K, V]> = [];

    for (let i = 0; i < minLen; i++) {
        result.push([arr[i], arr1[i], arr2[i]]);
    }

    return result;
};
