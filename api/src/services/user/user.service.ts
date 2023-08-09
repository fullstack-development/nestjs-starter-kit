import { DatabaseProvider, User } from '@lib/repository';
import { Injectable, Module } from '@nestjs/common';
import { CannotFindUser } from '../../core/errors.core';
import { date } from '../../utils';
import { sha256 } from '../../utils/crypt.utils';
import { EmailOrPasswordIncorrect, UserAlreadyExist, UserPayload } from './user.model';

@Injectable()
export class UserServiceProvider {
    constructor(private readonly db: DatabaseProvider) {}

    async createUser({ email, password }: UserPayload) {
        if ((await this.db.user.findFirst({ where: { email } })) !== null) {
            return new UserAlreadyExist();
        }

        return await this.db.user.create({
            data: {
                email,
                hash: sha256(password),
                created: date.now(),
                emailConfirmed: false,
            },
        });
    }

    async findVerifiedUser({ email, password }: UserPayload) {
        const user = await this.db.user.findFirst({ where: { email } });
        if (user === null || user.hash !== sha256(password)) {
            return new EmailOrPasswordIncorrect();
        }

        return user;
    }

    async confirmEmail(where: Partial<User>) {
        const user = await this.db.user.findFirst({ where });
        if (user === null) {
            return new CannotFindUser();
        }

        await this.db.user.update({
            where,
            data: {
                emailConfirmed: true,
            },
        });
    }

    async findUser(where: { id: number } | { email: string }) {
        const user = await this.db.user.findFirst({
            where,
            include: { refreshToken: true, emailConfirm: true },
        });

        return user || new CannotFindUser();
    }
}

@Module({
    providers: [UserServiceProvider],
    exports: [UserServiceProvider],
})
export class UserService {}
