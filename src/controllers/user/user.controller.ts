import { Controller, Module } from '@nestjs/common';
import {
    UsersRepository,
    UsersRepositoryProvider,
} from '../../repositories/users/users.repository';

@Controller('api/user')
export class UserControllerProvider {
    constructor(private usersRepository: UsersRepositoryProvider) {}
}

@Module({
    imports: [UsersRepository],
    controllers: [UserControllerProvider],
})
export class UserController {}
