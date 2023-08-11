import {
    IsFloatConstraint,
    IsSafeIntegerConstraint,
    IsSafeNumberConstraint,
} from './../validation.utils';

describe('IsSafeInteger', () => {
    let validator: IsSafeIntegerConstraint;

    beforeAll(() => {
        validator = new IsSafeIntegerConstraint();
    });

    it('should return false if value less then Number.MIN_SAFE_INTEGER', () => {
        expect(validator.validate(Number.MIN_SAFE_INTEGER - 1)).toBeFalsy();
    });

    it('should return false if value greater then Number.MAX_SAFE_INTEGER', () => {
        expect(validator.validate(Number.MAX_SAFE_INTEGER + 1)).toBeFalsy();
    });

    it('should return false if value is float', () => {
        expect(validator.validate(5.8)).toBeFalsy();
    });

    it('should return false if value is BigInt from hex digest', () => {
        const value = Number('0xd38c844f21130ad54b1cf9ec76bb891be7055a2f4b1396676d668b87b1019776');

        expect(Number.isInteger(value)).toBeTruthy();
        expect(validator.validate(value)).toBeFalsy();
    });

    it('should return false on negative integer', () => {
        expect(validator.validate(-1)).toBeFalsy();
        expect(validator.validate(-5)).toBeFalsy();
        expect(validator.validate(-10)).toBeFalsy();
        expect(validator.validate(-100)).toBeFalsy();
        expect(validator.validate(-1000)).toBeFalsy();
        expect(validator.validate(-10000)).toBeFalsy();
    });

    it('should return true on correct positive integer', () => {
        expect(validator.validate(0)).toBeTruthy();
        expect(validator.validate(1)).toBeTruthy();
        expect(validator.validate(5)).toBeTruthy();
        expect(validator.validate(10)).toBeTruthy();
        expect(validator.validate(100)).toBeTruthy();
        expect(validator.validate(1000)).toBeTruthy();
        expect(validator.validate(10000)).toBeTruthy();
    });
});

describe('IsFloat', () => {
    let validator: IsFloatConstraint;

    beforeAll(() => {
        validator = new IsFloatConstraint();
    });

    it('should return false if value greater then Number.MAX_VALUE', () => {
        expect(validator.validate(Number.MAX_VALUE + 0.5)).toBeFalsy();
        expect(validator.validate(-(Number.MAX_VALUE + 0.5))).toBeFalsy();
    });

    it('should return false if value is integer', () => {
        expect(validator.validate(Number.MAX_SAFE_INTEGER - 1)).toBeFalsy();
    });

    it('should return true on correct float', () => {
        expect(validator.validate(0.5)).toBeTruthy();
        expect(validator.validate(-100.54)).toBeTruthy();
        expect(validator.validate(100 / 3)).toBeTruthy();
        expect(validator.validate(1000000 / 7)).toBeTruthy();
        expect(validator.validate(399 / 8)).toBeTruthy();
        expect(validator.validate(-399 / 8)).toBeTruthy();
    });
});

describe('IsSafeNumber', () => {
    let validator: IsSafeNumberConstraint;

    beforeAll(() => {
        validator = new IsSafeNumberConstraint();
    });

    it('should return false if value less then Number.MIN_SAFE_INTEGER', () => {
        expect(validator.validate(Number.MIN_SAFE_INTEGER - 1)).toBeFalsy();
    });

    it('should return false if value greater then Number.MAX_SAFE_INTEGER', () => {
        expect(validator.validate(Number.MAX_SAFE_INTEGER + 1)).toBeFalsy();
    });

    it('should return false if value is BigInt from hex digest', () => {
        const value = Number('0xd38c844f21130ad54b1cf9ec76bb891be7055a2f4b1396676d668b87b1019776');

        expect(Number.isInteger(value)).toBeTruthy();
        expect(validator.validate(value)).toBeFalsy();
    });

    it('should return true on correct number', () => {
        const testCases = [
            0,
            1,
            5,
            10,
            100,
            1000,
            10000,
            -1,
            -5,
            -10,
            -100,
            -1000,
            -10000,
            -1 / 3,
            -5 / 4,
            -10 / 25,
            -100 / 105,
            -1000 / 3,
            -10000 / 5,
        ];

        for (const testCase of testCases) {
            expect(validator.validate(testCase)).toBeTruthy();
        }
    });
});
