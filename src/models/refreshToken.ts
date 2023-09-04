import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export default class RefreshToken extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	idUser: number;

	@Column()
	token: string;

	@Column()
	@CreateDateColumn()
	createdAt: Date;

	@Column({ type: 'bigint' })
	expires: number;
}
