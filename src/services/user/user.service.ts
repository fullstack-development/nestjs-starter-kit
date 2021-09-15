import { Injectable, Module } from '@nestjs/common';
import { resultFail, resultSuccess } from '../../model/result.model';
import { UserEntity } from '../../repositories/users/user.entity';
import {
    UsersRepository,
    UsersRepositoryProvider,
} from '../../repositories/users/users.repository';
import { date } from '../../utils';
import { sha256 } from '../../utils/crypt.utils';
import {
    cannotCreateUser,
    emailOrPasswordIncorrect,
    UserPayload,
    userAlreadyExist,
} from './user.model';

@Injectable()
export class UserServiceProvider {
    constructor(private usersRepository: UsersRepositoryProvider) {}

    async createUser({ email, password }: UserPayload) {
        if ((await this.usersRepository.findOne({ email })) !== null) {
            return resultFail(userAlreadyExist());
        }
        const id = await this.usersRepository.create({
            email,
            hash: sha256(password),
            created: date.now(),
            emailConfirmed: false,
        });
        const userResult = await this.usersRepository.findOne({ id });
        if (!userResult.success) {
            return resultFail(cannotCreateUser(email));
        }
        return userResult;
    }

    async findVerifiedUser({ email, password }: UserPayload) {
        const userResult = await this.usersRepository.findOne({ email });
        if (!userResult.success || userResult.data.hash !== sha256(password)) {
            return resultFail(emailOrPasswordIncorrect());
        }
        return userResult;
    }

    async confirmEmail(filter: Partial<UserEntity>) {
        const userResult = await this.usersRepository.findOne(filter);
        if (!userResult.success) {
            return userResult;
        }
        const updated = await this.usersRepository.updateOne(filter, { emailConfirmed: true });
        if (!updated.success) {
            return updated;
        }
        return resultSuccess();
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
