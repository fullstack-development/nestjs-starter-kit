import * as R from 'ramda';
import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import {
    ApiResponses,
    processControllerError,
    RequestUser,
    User,
} from '../../core/controller.core';
import { JwtAuthenticationGuardUser } from '../../services/auth/jwt-authentication.guard';
import { ErrorsService, ErrorsServiceProvider } from '../../services/errors/errors.service';
import { UserService, UserServiceProvider } from '../../services/user/user.service';
import { isError } from '../../core/errors.core';
import { CR_Me_Success, CR_Me_CannotFindUser } from './user.model';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('api/user')
@Controller('api/user')
export class UserControllerProvider {
    constructor(
        private userService: UserServiceProvider,
        private errorsService: ErrorsServiceProvider,
    ) {}

    @Get('me')
    @UseGuards(JwtAuthenticationGuardUser)
    @ApiResponses(CR_Me_Success, [CR_Me_CannotFindUser])
    async me(@User() requestUser: RequestUser) {
        const userResult = await this.userService.findUser(requestUser);
        if (isError(userResult)) {
            return await processControllerError(userResult, this.errorsService);
        } else {
            const user = R.omit(['hash', 'id', 'refreshToken'])(userResult);
            return new CR_Me_Success(user);
        }
    }
}

@Module({
    imports: [UserService, ErrorsService],
    controllers: [UserControllerProvider],
})
export class UserController {}
