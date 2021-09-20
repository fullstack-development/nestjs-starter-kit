import * as R from 'ramda';
import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { Fail, processControllerError, RequestUser, Success, User } from '../controller.model';
import { JwtAuthenticationGuardUser } from '../../services/auth/jwt-authentication.guard';
import { ErrorsService, ErrorsServiceProvider } from '../../services/errors/errors.service';
import { UserService, UserServiceProvider } from '../../services/user/user.service';

@Controller('api/user')
export class UserControllerProvider {
    constructor(
        private userService: UserServiceProvider,
        private errorsService: ErrorsServiceProvider,
    ) {}

    @Get('me')
    @UseGuards(JwtAuthenticationGuardUser)
    async me(@User() requestUser: RequestUser) {
        const userResult = await this.userService.findUser(requestUser);
        if (!userResult.success) {
            const error = await processControllerError(userResult, this.errorsService);
            return Fail(error.code, error.body);
        } else {
            const userMe = R.omit(['hash'])(userResult.data);
            return Success({ status: true, data: userMe });
        }
    }
}

@Module({
    imports: [UserService, ErrorsService],
    controllers: [UserControllerProvider],
})
export class UserController {}
