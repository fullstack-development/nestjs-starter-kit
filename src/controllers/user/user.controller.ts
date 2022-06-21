import * as R from 'ramda';
import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { processControllerError, RequestUser, User } from '../../core/controller.core';
import { JwtUserGuard } from '../../services/auth/jwt-user.guard';
import { ErrorsService, ErrorsServiceProvider } from '../../services/errors/errors.service';
import { UserService, UserServiceProvider } from '../../services/user/user.service';
import { isError } from '../../core/errors.core';
import { CR_Me_Success } from './user.model';

@Controller('api/user')
export class UserControllerProvider {
    constructor(
        private userService: UserServiceProvider,
        private errorsService: ErrorsServiceProvider,
    ) {}

    @Get('me')
    @UseGuards(JwtUserGuard)
    async me(@User() requestUser: RequestUser) {
        const userResult = await this.userService.findUser(requestUser);
        if (isError(userResult)) {
            return await processControllerError(userResult, this.errorsService);
        } else {
            const user = R.omit(['hash', 'id', 'refreshToken', 'emailConfirm'])(userResult);
            return new CR_Me_Success(user);
        }
    }
}

@Module({
    imports: [UserService, ErrorsService],
    controllers: [UserControllerProvider],
})
export class UserController {}
