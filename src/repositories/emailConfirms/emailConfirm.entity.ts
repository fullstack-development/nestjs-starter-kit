import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../model/repository.model';

@Entity()
export class EmailConfirmEntity extends BaseEntity {
    @Column()
    userId: number;

    @Column()
    confirmId: string;
}
