import { Injectable, Module } from '@nestjs/common';
import { User } from '@prisma/client';
import { CannotFindUser } from '../../repositories/repositoryErrors.model';
import {
    UsersRepository,
    UsersRepositoryProvider,
} from '../../repositories/users/users.repository';
import { date } from '../../utils';
import { sha256 } from '../../utils/crypt.utils';
import { EmailOrPasswordIncorrect, UserPayload, UserAlreadyExist } from './user.model';

@Injectable()
export class UserServiceProvider {
    constructor(private users: UsersRepositoryProvider) {}

    async createUser({ email, password }: UserPayload) {
        if ((await this.users.Dao.findFirst({ where: { email } })) !== null) {
            return new UserAlreadyExist();
        }

        return await this.users.Dao.create({
            data: {
                email,
                hash: sha256(password),
                created: date.now(),
                emailConfirmed: false,
            },
        });
    }

    async findVerifiedUser({ email, password }: UserPayload) {
        const user = await this.users.Dao.findFirst({ where: { email } });
        if (user === null || user.hash !== sha256(password)) {
            return new EmailOrPasswordIncorrect();
        }

        return user;
    }

    async confirmEmail(where: Partial<User>) {
        const user = await this.users.Dao.findFirst({ where });
        if (user === null) {
            return new CannotFindUser();
        }

        await this.users.Dao.update({
            where,
            data: {
                emailConfirmed: true,
            },
        });
    }

    async findUser(where: { id: number } | { email: string }) {
        const user = await this.users.Dao.findFirst({
            where,
            include: { refreshToken: true, emailConfirm: true },
        });

        return user || new CannotFindUser();
    }
}

@Module({
    imports: [UsersRepository],
    providers: [UserServiceProvider],
    exports: [UserServiceProvider],
})
export class UserService {}
