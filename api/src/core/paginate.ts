import { dissocPath, mergeRight, Path } from 'ramda';
import { Awaited, FirstArgument } from '../utils/typescript.utils';

type PaginateOptions = {
    page: number;
    pageSize: number;
};

export const omitPath = <T extends Record<string, unknown>>(
    path: Path,
    deletedKeys: Array<string>,
    obj: T,
) => {
    let result = obj;

    deletedKeys.forEach((key) => {
        result = dissocPath([...path, key], result);
    });

    return result;
};

export const paginate = async <
    T extends {
        findMany: (...args: Array<unknown>) => U;
        count: (...args: Array<unknown>) => Promise<number>;
    },
    P extends FirstArgument<T['findMany']>,
    U = ReturnType<T['findMany']>,
>(
    dao: T,
    payload: P,
    { page, pageSize }: PaginateOptions,
) => {
    const payloadWithPaginate = mergeRight(
        omitPath(['where'], ['page', 'pageSize'], payload as Record<string, unknown>),
        {
            skip: (page - 1) * pageSize,
            take: pageSize,
        },
    );

    const result = (await dao.findMany(payloadWithPaginate)) as Awaited<U>;
    // //TODO: need upgrade ts version for fix this

    return {
        page,
        pageSize,
        count: await dao.count(),
        result,
    };
};
