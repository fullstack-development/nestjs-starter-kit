import { BaseEntity, entities } from '@lib/repository';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { EntityMetadata } from 'typeorm';

type Ent = {
    [k: string]: {
        meta: EntityMetadata;
        entityClass: new () => BaseEntity;
    };
};

@Injectable()
export class ReactAdminAdapterService {
    private readonly entities: Ent;

    constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
        const ent: Ent = {};
        for (const meta of txHost.tx.connection.entityMetadatas) {
            const entityClass = entities.find((c) => c.name === meta.name);
            if (entityClass) {
                ent[meta.name] = { meta, entityClass };
            }
        }

        this.entities = ent;
    }

    public getEntity(name: string) {
        return this.entities[name];
    }

    public getEntityManager() {
        return this.txHost.tx.connection.manager;
    }
}
