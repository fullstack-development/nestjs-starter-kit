import { Controller, Module } from '@nestjs/common';
import { UserService, UserServiceProvider } from '../../services/user/user.service';

@Controller('api/user')
export class UserControllerProvider {
    constructor(private userService: UserServiceProvider) {}
}

@Module({
    imports: [UserService],
    controllers: [UserControllerProvider],
})
export class UserController {}
