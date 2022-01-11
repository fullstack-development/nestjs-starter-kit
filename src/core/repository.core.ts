import { RequestContext } from '@medibloc/nestjs-request-context';
import { PrimaryGeneratedColumn, getRepository, FindOneOptions } from 'typeorm';
import { TransactionsContext } from '../utils/transactions.utils';
import { BasicError } from './errors.core';

export class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
}

interface ErrorsConstructors<
    FE extends BasicError<string>,
    UE extends BasicError<string>,
    RE extends BasicError<string>,
> {
    findError: new () => FE;
    updateError: new () => UE;
    removeError: new () => RE;
}

export class BaseRepository<
    T extends BaseEntity,
    FE extends BasicError<string> = BasicError<string>,
    UE extends BasicError<string> = BasicError<string>,
    RE extends BasicError<string> = BasicError<string>,
> {
    constructor(
        protected entityConstructor: new () => T,
        protected errors: ErrorsConstructors<FE, UE, RE>,
    ) {}

    get nativeRepository() {
        return getRepository(this.entityConstructor);
    }

    protected get Manager() {
        return RequestContext.get<TransactionsContext>().transactions.Manager;
    }

    async create(entity: Omit<T, 'id'>): Promise<number> {
        const data = this.fillEntity(entity);
        // https://github.com/typeorm/typeorm/issues/2904
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const saved = await this.Manager.insert(this.entityConstructor, data as any);
        return saved.raw[0].id;
    }

    async findAll() {
        return await this.Manager.find(this.entityConstructor);
    }

    async findOne(filter: Partial<T>) {
        const entity = await this.Manager.findOne(this.entityConstructor, { where: filter });
        if (!entity) {
            return new this.errors.findError();
        }
        return entity;
    }

    async findOneRelations(options: FindOneOptions<T>) {
        const entity = await this.Manager.findOne(this.entityConstructor, options);

        if (!entity) {
            return new this.errors.findError();
        }

        return entity;
    }

    async updateOne(filter: Partial<T>, update: Partial<Omit<T, 'id'>>) {
        const data = this.fillEntity(update);
        // https://github.com/typeorm/typeorm/issues/2904
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updated = await this.Manager.update(this.entityConstructor, filter, data as any);
        if (!Boolean(updated.affected)) {
            const error = new this.errors.updateError();
            error.payload = { filter };
            return error;
        }
        return;
    }

    async removeOne(filter: Partial<T>) {
        const removed = await this.Manager.remove(this.entityConstructor, filter);
        if (!removed) {
            const error = new this.errors.removeError();
            error.payload = { filter };
            return error;
        }
        return;
    }

    async increment(filter: Partial<T>, key: keyof T, value: number) {
        const updated = await this.Manager.increment(
            this.entityConstructor,
            filter,
            String(key),
            value,
        );
        if (!Boolean(updated.affected)) {
            const error = new this.errors.updateError();
            error.payload = { filter };
            return error;
        }
        return;
    }

    async decrement(filter: Partial<T>, key: keyof T, value: number) {
        const updated = await this.Manager.decrement(
            this.entityConstructor,
            filter,
            String(key),
            value,
        );
        if (!Boolean(updated.affected)) {
            const error = new this.errors.updateError();
            error.payload = { filter };
            return error;
        }
        return;
    }

    async query(query: string) {
        return await this.Manager.query(query);
    }

    protected fillEntity(data: Partial<T> | Omit<T, 'id'> | Partial<Omit<T, 'id'>>): T {
        const keys = Object.getOwnPropertyNames(data);
        const entity = new this.entityConstructor();
        for (const key of keys) {
            entity[key] = data[key];
        }
        return entity;
    }
}
