import { Type } from '@nestjs/common';
import { IsOptional } from 'class-validator';

export const PartialType = <T extends Type<object>>(
    ClassRef: T,
): Type<Partial<InstanceType<T>>> => {
    const PartialDTOClass = class extends ClassRef {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: Array<any>) {
            super(...args);
            const keys = Object.getOwnPropertyNames(this);

            keys.forEach((key) => {
                if (key === 'constructor') return;
                IsOptional()(this, key);
            });
        }
    };

    Object.setPrototypeOf(PartialDTOClass.prototype, ClassRef.prototype);

    return PartialDTOClass as Type<Partial<InstanceType<T>>>;
};
