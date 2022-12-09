import { omitPath, paginate } from '../paginate';

describe('omitPath', () => {
    it('should success omit path', () => {
        const testCases = [
            {
                path: ['where'],
                keysForDelete: ['page', 'pageSize'],
                obj: {
                    where: { page: 1, pageSize: 50, test: true },
                },
                expectedValue: { where: { test: true } },
            },
            {
                path: ['where'],
                keysForDelete: ['page', 'pageSize'],
                obj: {
                    where: { page: 1, test: true },
                },
                expectedValue: { where: { test: true } },
            },
            {
                path: ['invalid'],
                keysForDelete: ['page', 'pageSize'],
                obj: {
                    where: { page: 1, test: true },
                },
                expectedValue: {
                    where: { page: 1, test: true },
                },
            },
        ];

        for (const testCase of testCases) {
            expect(omitPath(testCase.path, testCase.keysForDelete, testCase.obj)).toEqual(
                testCase.expectedValue,
            );
        }
    });
});

describe('paginate', () => {
    let count: jest.Mock;
    let findMany: jest.Mock;

    beforeAll(() => {
        count = jest.fn();
        findMany = jest.fn();
    });

    afterEach(() => {
        count.mockClear();
        findMany.mockClear();
    });

    it('should success omit PageOptions from payload and inject skip and take params', async () => {
        const dao = { count, findMany };

        const testCases = [
            {
                payload: { where: { test: true, page: 1, pageSize: 50 } },
                options: { page: 1, pageSize: 50 },
                expectedValue: { where: { test: true }, skip: 0, take: 50 },
            },
            {
                payload: { where: { test: true } },
                options: { page: 1, pageSize: 5 },
                expectedValue: { where: { test: true }, skip: 0, take: 5 },
            },
            {
                payload: { where: { test: true, page: 100, pageSize: 5000 } },
                options: { page: 2, pageSize: 5 },
                expectedValue: { where: { test: true }, skip: 5, take: 5 },
            },
            {
                payload: { where: { test: true }, orderBy: { test: true } },
                options: { page: 10, pageSize: 50 },
                expectedValue: {
                    where: { test: true },
                    orderBy: { test: true },
                    skip: 450,
                    take: 50,
                },
            },
        ];

        for (const testCase of testCases) {
            findMany.mockClear();
            await paginate(dao, testCase.payload, testCase.options);
            expect(findMany).toBeCalledWith(testCase.expectedValue);
        }
    });

    it('should success return records with count', async () => {
        const data = [{ test: true }, { test: true }, { test: true }];
        count.mockResolvedValueOnce(3);
        findMany.mockResolvedValueOnce(data);
        const result = await paginate(
            { count, findMany },
            { where: { test: true, page: 1, pageSize: 50 } },
            { page: 1, pageSize: 50 },
        );

        expect(findMany).toBeCalledWith({ where: { test: true }, skip: 0, take: 50 });
        expect(result).toEqual({ page: 1, pageSize: 50, count: 3, result: data });
    });
});
