import { Column, Entity } from 'typeorm';
import { BaseEntity } from './model';

@Entity({ name: 'admin' })
export class AdminEntity extends BaseEntity {
    @Column({ name: 'email', unique: true })
    email: string;

    @Column({ name: 'hash' })
    hash: string;

    @Column({ name: 'crated_at' })
    createdAt: Date;
}
