import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { AdminEntity, BalanceEntity, ItemEntity } from './entities';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class RepositoryService {
    constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

    get user() {
        return this.txHost.tx.getRepository(UserEntity);
    }

    get admin() {
        return this.txHost.tx.getRepository(AdminEntity);
    }

    get item() {
        return this.txHost.tx.getRepository(ItemEntity);
    }

    get balance() {
        return this.txHost.tx.getRepository(BalanceEntity);
    }
}
