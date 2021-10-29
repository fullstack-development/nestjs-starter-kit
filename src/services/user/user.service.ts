import { Injectable, Module } from '@nestjs/common';
import { isError } from '../../core/errors.core';
import { UserEntity } from '../../repositories/users/user.entity';
import {
    UsersRepository,
    UsersRepositoryProvider,
} from '../../repositories/users/users.repository';
import { date } from '../../utils';
import { sha256 } from '../../utils/crypt.utils';
import {
    CannotCreateUser,
    EmailOrPasswordIncorrect,
    UserPayload,
    UserAlreadyExist,
} from './user.model';

@Injectable()
export class UserServiceProvider {
    constructor(private usersRepository: UsersRepositoryProvider) {}

    async createUser({ email, password }: UserPayload) {
        if ((await this.usersRepository.findOne({ email })) !== null) {
            return new UserAlreadyExist();
        }
        const id = await this.usersRepository.create({
            email,
            hash: sha256(password),
            created: date.now(),
            emailConfirmed: false,
        });
        const userResult = await this.usersRepository.findOne({ id });
        if (isError(userResult)) {
            return new CannotCreateUser(email);
        }
        return userResult;
    }

    async findVerifiedUser({ email, password }: UserPayload) {
        const userResult = await this.usersRepository.findOne({ email });
        if (isError(userResult) || userResult.hash !== sha256(password)) {
            return new EmailOrPasswordIncorrect();
        }
        return userResult;
    }

    async confirmEmail(filter: Partial<UserEntity>) {
        const userResult = await this.usersRepository.findOne(filter);
        if (isError(userResult)) {
            return userResult;
        }
        const updatedResult = await this.usersRepository.updateOne(filter, {
            emailConfirmed: true,
        });
        if (isError(updatedResult)) {
            return updatedResult;
        }
        return true;
    }

    async findUser(filter: Pick<UserEntity, 'id'>) {
        return await this.usersRepository.findOne(filter);
    }
}

@Module({
    imports: [UsersRepository],
    providers: [UserServiceProvider],
    exports: [UserServiceProvider],
})
export class UserService {}
