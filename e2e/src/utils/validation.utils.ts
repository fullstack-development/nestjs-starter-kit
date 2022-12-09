import { ethers } from 'ethers';
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsSecretConstraint implements ValidatorConstraintInterface {
    validate(str: string) {
        try {
            new ethers.Wallet(str);
            return true;
        } catch {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} - must be valid secret!`;
    }
}

export function IsSecret(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsSecretConstraint,
        });
    };
}

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

@ValidatorConstraint({ async: false })
export class IsAddressConstraint implements ValidatorConstraintInterface {
    validate(str: string) {
        return ethers.utils.isAddress(str);
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} - must be valid address!`;
    }
}

export function IsAddress(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsAddressConstraint,
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
