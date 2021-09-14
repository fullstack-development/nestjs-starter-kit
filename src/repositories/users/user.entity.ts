import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../model/repository.model';

@Entity()
export class UserEntity extends BaseEntity {
    @Column()
    email: string;

    @Column()
    hash: string;

    @Column()
    emailConfirmed: boolean;

    @Column()
    created: Date;

    @Column()
    isBanned: boolean;
}
