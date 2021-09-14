import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IsEmail, IsNumber } from 'class-validator';
import { validateSync } from './validation.utils';

export class RequestUser {
    @IsNumber()
    id: number;

    @IsEmail()
    email: string;
}

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = validateSync(RequestUser, request.user);
    if (user.status === 'fail') {
        throw new Error('Cannot get user from request, but authentication was passed');
    }
    return user.value;
});
