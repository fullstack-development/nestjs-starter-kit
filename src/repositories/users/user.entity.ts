import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../model/repository.model';

@Entity()
export class UserEntity extends BaseEntity {
    @Column()
    readonly email: string;

    @Column()
    readonly hash: string;

    @Column()
    readonly emailConfirmed: boolean;

    @Column()
    readonly created: Date;

    @Column()
    readonly isBanned: boolean;
}
