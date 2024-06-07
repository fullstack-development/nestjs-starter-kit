import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user' })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    hash: string;

    @Column()
    createdAt: Date;

    @Column({ default: false })
    emailConfirmed: boolean;

    @Column({ nullable: true })
    refreshTokenHash?: string;

    @Column({ nullable: true })
    emailConfirmToken?: string;
}
