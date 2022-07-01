import { UsePipes, ValidationPipe } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
    validate as classValidate,
    validateSync as classValidateSync,
    ValidationError,
} from 'class-validator';
import { ValidatorOptions } from 'class-validator/types/validation/ValidatorOptions';

type ValidationSuccess<T> = {
    status: 'success';
    value: T;
};

type ValidationFail = {
    errors: Array<ValidationError>;
    status: 'fail';
};

export function validate<C>(
    SchemeClass: new () => C,
    data: unknown,
    options?: ValidatorOptions,
): Promise<ValidationSuccess<C> | ValidationFail> {
    const value = plainToClass(SchemeClass, data);
    return classValidate(value, options).then((errors) =>
        errors.length > 0 ? { errors, status: 'fail' } : { value, status: 'success' },
    );
}

export function validateSync<C>(
    SchemeClass: new () => C,
    data: unknown,
    options?: ValidatorOptions,
): ValidationSuccess<C> | ValidationFail {
    const value = plainToClass(SchemeClass, data);
    const errors = classValidateSync(value, options);
    return errors.length > 0 ? { errors, status: 'fail' } : { value, status: 'success' };
}

class CustomValidationPipe extends ValidationPipe {
    constructor() {
        super({
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
        });
    }
}

export function UseValidationPipe() {
    return UsePipes(new CustomValidationPipe());
}
