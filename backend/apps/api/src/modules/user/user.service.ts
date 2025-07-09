import { UserNotFound } from '@lib/core';
import { RepositoryService } from '@lib/repository';
import { Injectable, Logger } from '@nestjs/common';
import { SHA256 } from 'crypto-js';
import { UserAlreadyExists } from './common/user.errors';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(private readonly rep: RepositoryService) {}

    async createUser(email: string, password: string) {
        if (await this.rep.user.findOne({ where: { email } })) {
            return new UserAlreadyExists(email);
        }

        this.logger.log({
            message: 'Create user',
            payload: { email },
        });

        const user = this.rep.user.create({ email, hash: SHA256(password).toString(), createdAt: new Date() });
        await this.rep.user.save(user);

        return user;
    }

    async findUser(id: number) {
        const user = await this.rep.user.findOne({ where: { id } });
        if (!user) {
            return new UserNotFound({ userId: id });
        }

        return user;
    }
}
