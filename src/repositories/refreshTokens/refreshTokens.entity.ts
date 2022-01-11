import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../core/repository.core';
import { UserEntity } from '../users/user.entity';

@Entity()
export class RefreshTokenEntity extends BaseEntity {
    @Column({ type: 'varchar' })
    tokenHash: string;

    @OneToOne(() => UserEntity, (user) => user.refreshToken)
    @JoinColumn()
    user: UserEntity;
}
