import { plainToClass } from 'class-transformer';
import {
    validate as classValidate,
    validateSync as classValidateSync,
    ValidationError,
} from 'class-validator';

type ValidationSuccess<T> = {
    status: 'success';
    value: T;
};

type ValidationFail = {
    errors: Array<ValidationError>;
    status: 'fail';
};

export const validate = <C>(
    SchemeClass: new () => C,
    data: unknown,
): Promise<ValidationSuccess<C> | ValidationFail> => {
    const value = plainToClass(SchemeClass, data);
    return classValidate(value).then((errors) =>
        errors.length > 0 ? { errors, status: 'fail' } : { value, status: 'success' },
    );
};

export const validateSync = <C>(
    SchemeClass: new () => C,
    data: unknown,
): ValidationSuccess<C> | ValidationFail => {
    const value = plainToClass(SchemeClass, data);
    const errors = classValidateSync(value);
    return errors.length > 0 ? { errors, status: 'fail' } : { value, status: 'success' };
};
