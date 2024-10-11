import { UserEntity } from '@lib/repository/entities/user.entity';
import { Column, Entity, ManyToOne, Relation } from 'typeorm';
import { BaseEntity } from './model';

@Entity({ name: 'item' })
export class ItemEntity extends BaseEntity {
    @Column({ name: 'type' })
    type: string;

    @ManyToOne(() => UserEntity, (u) => u.items)
    user: Relation<UserEntity>;
}
