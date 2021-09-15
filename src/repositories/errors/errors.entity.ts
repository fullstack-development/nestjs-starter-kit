import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../model/repository.model';

@Entity()
export class ErrorEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 36 })
    uuid: string;

    @Column({ type: 'integer', nullable: true })
    userId?: number;

    @Column({ type: 'text' })
    error: string;

    @Column({ type: 'text', nullable: true })
    stackTrace?: string;

    @Column({ type: 'text', nullable: true })
    message?: string;

    @Column({ type: 'binary', nullable: true })
    payload?: Buffer;
}
