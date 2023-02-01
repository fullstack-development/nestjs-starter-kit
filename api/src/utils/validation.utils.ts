import { UsePipes, ValidationPipe } from '@nestjs/common';
import { plainToClass, Transform, Type } from 'class-transformer';
import {
    IsBase64,
    isBase64,
    IsDate,
    IsNumber,
    isNumber,
    IsOptional,
    IsString,
    registerDecorator,
    validate as classValidate,
    validateSync as classValidateSync,
    ValidationArguments,
    ValidationError,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
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
    return classValidate(value as Record<string, unknown>, options).then((errors) =>
        errors.length > 0 ? { errors, status: 'fail' } : { value, status: 'success' },
    );
}

export function validateSync<C>(
    SchemeClass: new () => C,
    data: unknown,
    options?: ValidatorOptions,
): ValidationSuccess<C> | ValidationFail {
    const value = plainToClass(SchemeClass, data);
    const errors = classValidateSync(value as Record<string, unknown>, options);
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

export const isSort = (accessKeys: Array<string>) => {
    const _class = class implements ValidatorConstraintInterface {
        validate(sort: [string, 'asc' | 'desc']) {
            return (
                typeof sort[0] === 'string' &&
                accessKeys.includes(sort[0]) &&
                (sort[1] === 'asc' || sort[1] === 'desc')
            );
        }

        defaultMessage() {
            return `sort must be the tuple [${accessKeys.join(' | ')}, "asc" | "desc"]!`;
        }
    };

    ValidatorConstraint({ name: 'isSort', async: false })(_class);

    return _class;
};

@ValidatorConstraint({ async: true })
export class IsBigIntStringConstraint implements ValidatorConstraintInterface {
    validate(str: string) {
        try {
            BigInt(str);
            return true;
        } catch {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} - must be a string convertible to BigInt!`;
    }
}

export function IsBigIntString(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsBigIntStringConstraint,
        });
    };
}

const isImageBase64 = (str: string) => {
    const supportedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/jpg', 'image/gif'];
    try {
        const [header, base64Str] = str.split(',');
        const [dataWithMimeType, decodeType] = header.split(';');
        const [, mimeType] = dataWithMimeType.split(':');
        return (
            isBase64(base64Str) && decodeType === 'base64' && supportedMimeTypes.includes(mimeType)
        );
    } catch {
        return false;
    }
};

const convertToImageBase64 = (value: string) => {
    try {
        const [header, base64] = value.split(',');
        const [dataWithMimeType] = header.split(';');
        const [, mimeType] = dataWithMimeType.split(':');
        return plainToClass(Base64Image, {
            input: value,
            mimeType,
            ext: mimeType.split('/')[1],
            base64,
        });
    } catch {
        return plainToClass(Base64Image, {});
    }
};

@ValidatorConstraint()
export class IsImageBase64Constraint implements ValidatorConstraintInterface {
    validate(str: string) {
        return isImageBase64(str);
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} - must be a base64 image string!`;
    }
}

export function IsImageBase64(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsImageBase64Constraint,
        });
    };
}

@ValidatorConstraint()
export class IsSafeIntegerConstraint implements ValidatorConstraintInterface {
    validate(value: number) {
        return Number.isSafeInteger(value) && value >= 0;
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} - must be a safe integer!`;
    }
}

export function IsSafeInteger(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsSafeIntegerConstraint,
        });
    };
}

@ValidatorConstraint()
export class IsFloatConstraint implements ValidatorConstraintInterface {
    validate(value: number) {
        return (
            typeof value === 'number' &&
            !Number.isNaN(value) &&
            !Number.isInteger(value) &&
            Math.abs(value) < Number.MAX_VALUE
        );
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} - must be a safe float!`;
    }
}

export function IsFloat(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsFloatConstraint,
        });
    };
}

@ValidatorConstraint()
export class IsSafeNumberConstraint implements ValidatorConstraintInterface {
    validate(value: number) {
        return (
            typeof value === 'number' &&
            isNumber(value) &&
            value < Number.MAX_SAFE_INTEGER &&
            value > Number.MIN_SAFE_INTEGER
        );
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} - must be a safe number!`;
    }
}

export function IsSafeNumber(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsSafeNumberConstraint,
        });
    };
}

export class Base64Image {
    @IsImageBase64()
    input: string;

    @IsString()
    mimeType: string;

    @IsString()
    ext: string;

    @IsBase64()
    base64: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const TransformImageBase64ToObject = () => (target: object, propertyKey: string) => {
    Transform(({ value }) => {
        if (typeof value === 'string') {
            return convertToImageBase64(value);
        }

        if (Array.isArray(value) && value.every((val) => typeof val === 'string')) {
            return value.map((val) => convertToImageBase64(val));
        }

        return value;
    })(target, propertyKey);
};
@ValidatorConstraint({ async: true })
export class IsBooleanStringConstraint implements ValidatorConstraintInterface {
    validate(str: string) {
        return str === 'true' || str === 'True';
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} - must be a string convertible to Boolean!`;
    }
}

export class CompareNumberQuery {
    @IsOptional()
    @IsNumber()
    lte?: number;

    @IsOptional()
    @IsNumber()
    gte?: number;

    @IsOptional()
    @IsNumber()
    equals?: number;
}

export class CompareDateQuery {
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    lte?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    gte?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    equals?: string;
}
