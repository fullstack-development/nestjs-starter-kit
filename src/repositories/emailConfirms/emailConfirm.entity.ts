import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../model/repository.model';

@Entity()
export class EmailConfirmEntity extends BaseEntity {
    @Column()
    readonly userId: number;

    @Column()
    readonly confirmId: string;
}
