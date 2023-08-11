import { removeNullableValues, zipThreeArrays } from '../ramda.utils';

describe('removeNullableValues', () => {
    it('should return array without nullable values', () => {
        const array = [1, 2, 3, null, 6, undefined];
        expect(removeNullableValues(array)).toEqual([1, 2, 3, 6]);
        expect(removeNullableValues([1, 2, 3])).toEqual([1, 2, 3]);
    });
});

describe('zipThreeArrays', () => {
    it('should return new array of triplets', () => {
        expect(zipThreeArrays([1, 2, 3], [4, 5, 6], [7, 8, 9])).toEqual([
            [1, 4, 7],
            [2, 5, 8],
            [3, 6, 9],
        ]);
        expect(zipThreeArrays([1, 2, 3], [4, 5, 6], [7, 8])).toEqual([
            [1, 4, 7],
            [2, 5, 8],
        ]);
    });
});
