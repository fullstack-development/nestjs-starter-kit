import { Column, Entity, JoinColumn, OneToOne, Relation } from 'typeorm';
import type { BalanceEntity } from './balance.entity';
import { BaseEntity } from './model';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
    @Column({ unique: true, name: 'email' })
    email: string;

    @Column({ name: 'hash' })
    hash: string;

    @Column({ name: 'crated_at' })
    createdAt: Date;

    @Column({ default: false, name: 'email_confirmed' })
    emailConfirmed: boolean;

    @Column({ type: 'text', nullable: true, name: 'refresh_token_hash' })
    refreshTokenHash?: string | null;

    @Column({ type: 'text', nullable: true, name: 'email_confirm_token' })
    emailConfirmToken?: string | null;

    @OneToOne('BalanceEntity', 'user', { onDelete: 'CASCADE' })
    @JoinColumn()
    balance: Relation<BalanceEntity>;
}
