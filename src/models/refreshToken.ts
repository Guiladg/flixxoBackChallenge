import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import User from './user';

@Entity()
export default class RefreshToken extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE', orphanedRowAction: 'delete' })
	user: User;

	@Column()
	token: string;

	@Column()
	@CreateDateColumn()
	createdAt: Date;

	@Column({ type: 'bigint' })
	expires: number;
}
