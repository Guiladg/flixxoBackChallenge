import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import Currency from './currency';

@Entity()
export default class Price extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Currency, { onDelete: 'CASCADE', orphanedRowAction: 'delete' })
	currency: Currency;

	@Column()
	value: number;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	date: Date;
}
