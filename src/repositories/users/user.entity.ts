import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../core/repository.core';

@Entity()
export class UserEntity extends BaseEntity {
    @Column({ type: 'text' })
    email: string;

    @Column({ type: 'varchar', length: 64 })
    hash: string;

    @Column({ type: 'boolean' })
    emailConfirmed: boolean;

    @Column({ type: 'timestamptz' })
    created: Date;
}
