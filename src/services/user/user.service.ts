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
    CannotCreateUser,
    EmailOrPasswordIncorrect,
    UserPayload,
    UserAlreadyExist,
} from './user.model';

@Injectable()
export class UserServiceProvider {
    constructor(private usersRepository: UsersRepositoryProvider) {}

    createUser = async ({ email, password }: UserPayload) => {
        if ((await this.usersRepository.findOne({ email })) !== null) {
            return resultFail(new UserAlreadyExist());
        }
        const id = await this.usersRepository.create({
            email,
            hash: sha256(password),
            created: date.now(),
            isBanned: false,
            emailConfirmed: false,
        });
        const userResult = await this.usersRepository.findOne({ id });
        if (!userResult.success) {
            return resultFail(new CannotCreateUser(email));
        }
        return userResult;
    };

    findVerifiedUser = async ({ email, password }: UserPayload) => {
        const userResult = await this.usersRepository.findOne({ email });
        if (!userResult.success || userResult.data.hash !== sha256(password)) {
            return resultFail(new EmailOrPasswordIncorrect());
        }
        return userResult;
    };

    confirmEmail = async (filter: Partial<UserEntity>) => {
        const userResult = await this.usersRepository.findOne(filter);
        if (!userResult.success) {
            return userResult;
        }
        const updated = await this.usersRepository.updateOne(filter, { emailConfirmed: true });
        if (!updated.success) {
            return updated;
        }
        return resultSuccess();
    };

    findUser = async (filter: Pick<UserEntity, 'id'>) => {
        return await this.usersRepository.findOne(filter);
    };
}

@Module({
    imports: [UsersRepository],
    providers: [UserServiceProvider],
    exports: [UserServiceProvider],
})
export class UserService {}
