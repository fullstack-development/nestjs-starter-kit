import { Injectable, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../model/repository.model';
import { UserEntity } from './user.entity';
import { CannotFindUser, CannotRemoveUser, CannotUpdateUser } from './user.model';

@Injectable()
export class UsersRepositoryProvider extends BaseRepository<
    UserEntity,
    CannotFindUser,
    CannotUpdateUser,
    CannotRemoveUser
> {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
    ) {
        super(usersRepository, {
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