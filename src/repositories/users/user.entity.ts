import { Entity, Column, OneToOne } from 'typeorm';
import { BaseEntity } from '../../core/repository.core';
import { RefreshTokenEntity } from '../refreshTokens/refreshTokens.entity';

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

    @OneToOne(() => RefreshTokenEntity, (token) => token.user, { nullable: true })
    refreshToken: RefreshTokenEntity | null;
}
