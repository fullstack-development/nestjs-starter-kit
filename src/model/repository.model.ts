import { RequestContext } from '@medibloc/nestjs-request-context';
import { PrimaryGeneratedColumn } from 'typeorm';
import { TransactionsContext } from '../utils/transactions.utils';
import { BaseError } from './errors.model';
import { resultFail, resultSuccess } from './result.model';

export class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
}

interface ErrorsConstructors<FE extends BaseError, UE extends BaseError, RE extends BaseError> {
    findError: () => FE;
    updateError: () => UE;
    removeError: () => RE;
}

export class BaseRepository<
    T extends BaseEntity,
    FE extends BaseError = BaseError,
    UE extends BaseError = BaseError,
    RE extends BaseError = BaseError,
> {
    constructor(
        private entityConstructor: new () => T,
        private errors: ErrorsConstructors<FE, UE, RE>,
    ) {}

    private get manager() {
        return RequestContext.get<TransactionsContext>().transactions.Manager;
    }

    async create(entity: Omit<T, 'id'>): Promise<number> {
        const data = this.fillEntity(entity);
        // https://github.com/typeorm/typeorm/issues/2904
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const saved = await this.manager.insert(this.entityConstructor, data as any);
        return saved.raw.insertId;
    }

    async findAll() {
        return await this.manager.find(this.entityConstructor);
    }

    async findOne(filter: Partial<T>) {
        const entity = await this.manager.findOne(this.entityConstructor, { where: filter });
        if (!entity) {
            return resultFail(this.errors.findError());
        }
        return resultSuccess(entity);
    }

    async updateOne(filter: Partial<T>, update: Partial<Omit<T, 'id'>>) {
        const data = this.fillEntity(update);
        // https://github.com/typeorm/typeorm/issues/2904
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updated = await this.manager.update(this.entityConstructor, filter, data as any);
        if (!Boolean(updated.affected)) {
            const error = this.errors.updateError();
            error.extra = { ...(error.extra ?? {}), payload: { filter } };
            return resultFail(error);
        }
        return resultSuccess();
    }

    async removeOne(filter: Partial<T>) {
        const removed = await this.manager.remove(this.entityConstructor, filter);
        if (!removed) {
            const error = this.errors.removeError();
            error.extra = { ...(error.extra ?? {}), payload: { filter } };
            return resultFail(error);
        }
        return resultSuccess();
    }

    async increment(filter: Partial<T>, key: keyof T, value: number) {
        const updated = await this.manager.increment(
            this.entityConstructor,
            filter,
            String(key),
            value,
        );
        if (!Boolean(updated.affected)) {
            const error = this.errors.updateError();
            error.extra = { ...(error.extra ?? {}), payload: { filter } };
            return resultFail(error);
        }
        return resultSuccess();
    }

    async decrement(filter: Partial<T>, key: keyof T, value: number) {
        const updated = await this.manager.decrement(
            this.entityConstructor,
            filter,
            String(key),
            value,
        );
        if (!Boolean(updated.affected)) {
            const error = this.errors.updateError();
            error.extra = { ...(error.extra ?? {}), payload: { filter } };
            return resultFail(error);
        }
        return resultSuccess();
    }

    async query(query: string) {
        return await this.manager.query(query);
    }

    private fillEntity(data: Partial<T> | Omit<T, 'id'> | Partial<Omit<T, 'id'>>): T {
        const keys = Object.getOwnPropertyNames(data);
        const entity = new this.entityConstructor();
        for (const key of keys) {
            entity[key] = data[key];
        }
        return entity;
    }
}
