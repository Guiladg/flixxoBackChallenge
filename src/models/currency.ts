import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import Price from './price';

@Entity()
@Unique(['name', 'symbol'])
export default class Currency extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@IsNotEmpty()
	name: string;

	@Column()
	@IsNotEmpty()
	symbol: string;

	@OneToMany(() => Price, (price: Price) => price.currency, { cascade: true })
	prices: Price[];

	@Column({ default: null })
	introductionYear: number;
}
