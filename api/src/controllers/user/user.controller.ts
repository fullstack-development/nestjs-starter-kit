import * as R from 'ramda';
import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { ControllerResponse, mapResponse, RequestUser, User } from '../../core/controller.core';
import { JwtUserGuard } from '../../services/auth/guards/jwt-user.guard';
import { UserService, UserServiceProvider } from '../../services/user/user.service';

@Controller('api/user')
export class UserControllerProvider {
    constructor(private users: UserServiceProvider) {}

    @Get('me')
    @UseGuards(JwtUserGuard)
    async me(@User() { id }: RequestUser) {
        return mapResponse(await this.users.findUser({ id }))((user) => {
            return ControllerResponse.Success({
                body: R.omit(['refreshToken'], user),
            });
        });
    }
}

@Module({
    imports: [UserService],
    controllers: [UserControllerProvider],
})
export class UserController {}
