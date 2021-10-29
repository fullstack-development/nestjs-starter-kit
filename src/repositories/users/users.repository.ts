import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/repository.core';
import { UserEntity } from './user.entity';
import { CannotFindUser, CannotRemoveUser, CannotUpdateUser } from './user.model';

@Injectable()
export class UsersRepositoryProvider extends BaseRepository<
    UserEntity,
    CannotFindUser,
    CannotUpdateUser,
    CannotRemoveUser
> {
    constructor() {
        super(UserEntity, {
            findError: CannotFindUser,
            updateError: CannotUpdateUser,
            removeError: CannotRemoveUser,
        });
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [UsersRepositoryProvider],
    exports: [UsersRepositoryProvider],
})
export class UsersRepository {}
