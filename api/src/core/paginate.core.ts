import { dissocPath, mergeRight, Path } from 'ramda';
import { FirstArgument } from '../utils/typescript.utils';

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
    P extends { find?: FirstArgument<T['findMany']>; count?: FirstArgument<T['count']> },
    U = ReturnType<T['findMany']>,
>(
    dao: T,
    { page, pageSize }: PaginateOptions,
    payload = { count: {}, find: {} } as P,
) => {
    const findPayload = payload.find || {};
    const countPayload = payload.count || {};
    const payloadWithPaginate = mergeRight(
        omitPath(['where'], ['page', 'pageSize'], findPayload as Record<string, unknown>),
        {
            skip: (page - 1) * pageSize,
            take: pageSize,
        },
    );

    const result = await dao.findMany(payloadWithPaginate);

    return {
        page,
        pageSize,
        count: await dao.count(countPayload),
        result,
    };
};
