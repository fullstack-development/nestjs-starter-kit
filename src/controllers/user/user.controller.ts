import * as R from 'ramda';
import { Controller, Get, HttpStatus, Module, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { processControllerError } from '../../model/controller.model';
import { JwtAuthenticationGuardUser } from '../../services/auth/jwt-authentication.guard';
import { ErrorsService, ErrorsServiceProvider } from '../../services/errors/errors.service';
import { UserService, UserServiceProvider } from '../../services/user/user.service';
import { RequestUser, User } from '../../utils/controller.utils';

@Controller('api/user')
export class UserControllerProvider {
    constructor(
        private userService: UserServiceProvider,
        private errorsService: ErrorsServiceProvider,
    ) {}

    @Get('me')
    @UseGuards(JwtAuthenticationGuardUser)
    async me(@Res() response: Response, @User() user: RequestUser) {
        const userResult = await this.userService.findUser(user);
        if (!userResult.success) {
            const error = await processControllerError(userResult, this.errorsService);
            response.status(error.code);
            response.send(error.body);
        } else {
            const data = R.omit(['hash'])(userResult.data);
            response.status(HttpStatus.OK);
            response.send({ status: true, data });
        }
    }
}

@Module({
    imports: [UserService, ErrorsService],
    controllers: [UserControllerProvider],
})
export class UserController {}
