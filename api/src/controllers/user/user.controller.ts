import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import * as R from 'ramda';
import { ControllerResponse, mapResponse, RequestUser, User } from '../../core/controller.core';
import { JwtUserGuard } from '../../services/auth/guards/jwt-user.guard';
import { UserService, UserServiceProvider } from '../../services/user/user.service';
import { MeResponse as MRS } from './user.model';

@Controller('api/user')
export class UserControllerProvider {
    constructor(private users: UserServiceProvider) {}

    @Get('me')
    @UseGuards(JwtUserGuard)
    async me(@User() { id }: RequestUser): Promise<MRS> {
        return mapResponse(
            await this.users.findUser({ id }),
            (user) =>
                new ControllerResponse(R.omit(['refreshToken', 'emailConfirm', 'hash'], user)),
        );
    }
}

@Module({
    imports: [UserService],
    controllers: [UserControllerProvider],
})
export class UserController {}
