import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, VirtualColumn } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export const userRoles = ['admin'] as const;
export type UserRole = (typeof userRoles)[number];

@Entity('user')
@Unique(['username', 'email'])
export default class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@VirtualColumn({ query: (alias) => `CONCAT(${alias}."lastName", ', ', ${alias}."firstName")` })
	fullName: string;

	@Column({ nullable: false, length: 20 })
	username: string;

	@Column({ nullable: false })
	password: string;

	@Column({ nullable: false, type: 'enum', enum: userRoles })
	role: UserRole;

	@Column({ nullable: false, length: 320 })
	email: string;

	async hashPassword(): Promise<void> {
		this.password = await bcrypt.hash(this.password, 8);
	}

	async checkPassword(unencryptedPassword: string): Promise<boolean> {
		return bcrypt.compare(unencryptedPassword, this.password);
	}
}
