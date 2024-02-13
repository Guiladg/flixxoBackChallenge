import { Model, ForeignKey, NonAttribute, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import DB from '../DB';
import Currency from './currency';

export default class Price extends Model<InferAttributes<Price>, InferCreationAttributes<Price>> {
	// Attributes
	declare id: CreationOptional<number>;
	declare date: CreationOptional<Date>;
	declare value: number;

	// Relationships
	declare CurrencyId: ForeignKey<Currency['id']>;
	declare Currency: NonAttribute<Currency>;
}

const sequelize = DB.getInstance();

Price.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		date: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		value: {
			type: DataTypes.FLOAT,
			allowNull: false
		}
	},
	{
		defaultScope: {
			order: [['date', 'desc']]
		},
		sequelize,
		modelName: 'Price',
		tableName: `${process.env.DB_PREFIX}price`
	}
);
Price.belongsTo(Currency, { onDelete: 'CASCADE' });
Currency.hasMany(Price); // If this line is in currency.ts (the logical approach), sequelize throws an error
