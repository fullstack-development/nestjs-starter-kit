import * as R from 'ramda';
import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { ControllerResponse, mapResponse, RequestUser, User } from '../../core/controller.core';
import { JwtUserGuard } from '../../services/auth/jwt-user.guard';
import { UserService, UserServiceProvider } from '../../services/user/user.service';

@Controller('api/user')
export class UserControllerProvider {
    constructor(private userService: UserServiceProvider) {}

    @Get('me')
    @UseGuards(JwtUserGuard)
    async me(@User() requestUser: RequestUser) {
        return mapResponse(await this.userService.findUser(requestUser))((user) =>
            ControllerResponse.Success({
                body: R.omit(['hash', 'id', 'refreshToken', 'emailConfirm'])(user),
            }),
        );
    }
}

@Module({
    imports: [UserService],
    controllers: [UserControllerProvider],
})
export class UserController {}
