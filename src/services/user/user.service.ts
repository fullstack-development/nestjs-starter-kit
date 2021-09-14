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
        const user = await this.usersRepository.findOne({ id });
        if (user === null) {
            return resultFail(new CannotCreateUser(email));
        }
        return resultSuccess(user);
    };

    findVerifiedUser = async ({ email, password }: UserPayload) => {
        const user = await this.usersRepository.findOne({ email });
        if (!user.success || user.data.hash !== sha256(password)) {
            return resultFail(new EmailOrPasswordIncorrect());
        }
        return user;
    };

    confirmEmail = async (filter: Partial<UserEntity>) => {
        const user = await this.usersRepository.findOne(filter);
        if (!user.success) {
            return user;
        }
        const updated = await this.usersRepository.updateOne(filter, { emailConfirmed: true });
        if (!updated.success) {
            return updated;
        }
        return resultSuccess();
    };
}

@Module({
    imports: [UsersRepository],
    providers: [UserServiceProvider],
    exports: [UserServiceProvider],
})
export class UserService {}
