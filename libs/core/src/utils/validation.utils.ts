import { UsePipes, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import {
    ValidateBy,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    isArray,
    isBoolean,
    isInt,
    isNumber,
    isNumberString,
    isString,
} from 'class-validator';

class CustomValidationPipe extends ValidationPipe {
    constructor() {
        super({
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
        });
    }
}

export function UseValidationPipe(options?: ValidationPipeOptions) {
    if (options) {
        return UsePipes(new ValidationPipe(options));
    }
    return UsePipes(new CustomValidationPipe());
}

const InnerTypesValidator = {
    number: isNumber,
    string: isString,
    numberString: isNumberString,
    int: isInt,
    array: isArray,
    boolean: isBoolean,
};

export const IsGenericType = (
    validators: Array<keyof typeof InnerTypesValidator | ((value: unknown) => boolean)>,
    validationOptions?: ValidationOptions,
) =>
    ValidateBy(
        {
            name: 'IS_GENERIC_TYPE',
            validator: {
                validate: (value: unknown) => {
                    return validators.some((item) =>
                        typeof item === 'function' ? item(value) : InnerTypesValidator[item]?.(value),
                    );
                },
                defaultMessage: (validationArguments?: ValidationArguments) => {
                    return `${validationArguments?.property}: Data type mismatch`;
                },
            },
        },
        validationOptions,
    );

@ValidatorConstraint({ name: 'isSort', async: false })
export class IsSort implements ValidatorConstraintInterface {
    validate(sort: [string, 'ASC' | 'DESC']) {
        return typeof sort[0] === 'string' && (sort[1] === 'ASC' || sort[1] === 'DESC');
    }

    defaultMessage() {
        return 'sort must be the tuple [string, "ASC" | "DESC"]';
    }
}

@ValidatorConstraint({ name: 'isRange', async: false })
export class IsRange implements ValidatorConstraintInterface {
    validate(range: [number, number]) {
        return typeof range[0] === 'number' && typeof range[1] === 'number';
    }

    defaultMessage() {
        return 'range must be the tuple [number, number]';
    }
}
