import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseRepository } from '../../model/repository.model';
import { UserEntity } from './user.entity';
import {
    CannotFindUser,
    CannotRemoveUser,
    CannotUpdateUser,
    cannotFindUser,
    cannotRemoveUser,
    cannotUpdateUser,
} from './user.model';

@Injectable()
export class UsersRepositoryProvider extends BaseRepository<
    UserEntity,
    CannotFindUser,
    CannotUpdateUser,
    CannotRemoveUser
> {
    constructor() {
        super(UserEntity, {
            findError: cannotFindUser,
            updateError: cannotUpdateUser,
            removeError: cannotRemoveUser,
        });
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [UsersRepositoryProvider],
    exports: [UsersRepositoryProvider],
})
export class UsersRepository {}
