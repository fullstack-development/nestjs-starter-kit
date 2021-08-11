import { plainToClass } from 'class-transformer';
import {
    validate as classValidate,
    validateSync as classValidateSync,
    ValidationError,
} from 'class-validator';

interface IValidationSuccess<T> {
    status: 'success';
    value: T;
}

interface IValidationFail {
    errors: Array<ValidationError>;
    status: 'fail';
}

export const validate = <C>(
    SchemeClass: new () => C,
    data: unknown,
): Promise<IValidationSuccess<C> | IValidationFail> => {
    const value = plainToClass(SchemeClass, data);
    return classValidate(value).then((errors) =>
        errors.length > 0 ? { errors, status: 'fail' } : { value, status: 'success' },
    );
};

export const validateSync = <C>(
    SchemeClass: new () => C,
    data: unknown,
): IValidationSuccess<C> | IValidationFail => {
    const value = plainToClass(SchemeClass, data);
    const errors = classValidateSync(value);
    return errors.length > 0 ? { errors, status: 'fail' } : { value, status: 'success' };
};
