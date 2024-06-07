import { ContextUser, User, makeResponse } from '@lib/core';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtUserGuard } from '../auth/guards/jwt-user.guard';
import { meToBody } from './common/user.model';
import { UserService } from './user.service';

@Controller('/api/user')
export class UserController {
    constructor(private readonly user: UserService) {}

    @Get('me')
    @UseGuards(JwtUserGuard)
    async me(@User() { id }: ContextUser) {
        return makeResponse(await this.user.findUser(id), meToBody);
    }
}
