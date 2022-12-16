import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsTrueConstraint implements ValidatorConstraintInterface {
    validate(bool: boolean) {
        return bool === true;
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} - must be true!`;
    }
}

export function IsTrue(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsTrueConstraint,
        });
    };
}

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
