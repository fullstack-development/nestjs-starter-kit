import { Repository, PrimaryGeneratedColumn } from 'typeorm';
import { BaseError } from './errors.model';
import { resultFail, resultSuccess } from './result.model';

export class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
}

export class BaseRepository<
    T extends BaseEntity,
    FE extends BaseError = BaseError,
    UE extends BaseError = BaseError,
    RE extends BaseError = BaseError,
> {
    constructor(
        private repository: Repository<T>,
        private errors: {
            findError: new () => FE;
            updateError: new () => UE;
            removeError: new () => RE;
        },
    ) {}

    create = async (entity: Omit<T, 'id'>): Promise<number> => {
        // https://github.com/typeorm/typeorm/issues/2904
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const saved = (await this.repository.save(entity as any)) as T;
        return saved.id;
    };

    findAll = () => this.repository.find();

    findOne = async (filter: Partial<T>) => {
        const entity = await this.repository.findOne(filter);
        if (!entity) {
            return resultFail(new this.errors.findError());
        }
        return resultSuccess(entity);
    };

    updateOne = async (filter: Partial<T>, update: Partial<Omit<T, 'id'>>) => {
        const entity = await this.findOne(filter);
        if (!entity.success) {
            return entity;
        }
        // https://github.com/typeorm/typeorm/issues/2904
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updated = await this.repository.update(filter, update as any);
        if (!Boolean(updated.affected)) {
            const error = new this.errors.updateError();
            error.extra = { ...(error.extra ?? {}), payload: { filter } };
            return resultFail(error);
        }
        return resultSuccess();
    };

    removeOne = async (filter: Partial<T>) => {
        const removed = await this.repository.delete(filter);
        if (!Boolean(removed.affected)) {
            const error = new this.errors.removeError();
            error.extra = { ...(error.extra ?? {}), payload: { filter } };
            return resultFail(error);
        }
        return resultSuccess();
    };
}
