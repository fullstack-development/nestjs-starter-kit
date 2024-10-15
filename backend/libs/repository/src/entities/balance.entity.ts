import { Column, Entity, OneToOne, Relation } from 'typeorm';
import { BaseEntity } from './model';
import type { UserEntity } from './user.entity';

@Entity({ name: 'balance' })
export class BalanceEntity extends BaseEntity {
    @Column({ type: 'real', name: 'cash' })
    cash: number;

    @OneToOne('UserEntity', 'balance')
    user: Relation<UserEntity>;
}
