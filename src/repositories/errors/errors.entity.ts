import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../model/repository.model';

@Entity()
export class ErrorEntity extends BaseEntity {
    @Column()
    uuid: string;

    @Column()
    userId: number;

    @Column()
    error: string;

    @Column({ nullable: true })
    stackTrace?: string;

    @Column({ nullable: true })
    message?: string;

    @Column({ nullable: true, type: 'binary' })
    payload?: Buffer;
}
