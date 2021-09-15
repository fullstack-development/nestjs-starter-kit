import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../model/repository.model';

@Entity()
export class EmailConfirmEntity extends BaseEntity {
    @Column({ type: 'integer' })
    userId: number;

    @Column({ type: 'varchar', length: 36 })
    confirmId: string;
}
