import Price from './price';
import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import DB from '../DB';

export default class Currency extends Model<InferAttributes<Currency>, InferCreationAttributes<Currency>> {
	// Attributes
	declare id: CreationOptional<number>;
	declare name: string;
	declare symbol: string;
	declare introductionYear: number;

	// Relationships
	declare prices?: CreationOptional<Price[]>;
}

const sequelize = DB.getInstance();

Currency.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		symbol: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		introductionYear: {
			type: DataTypes.STRING,
			allowNull: false
		}
	},
	{
		scopes: {
			noId: {
				attributes: ['name', 'symbol', 'introductionYear']
			}
		},
		sequelize,
		modelName: 'Currency',
		tableName: `${process.env.DB_PREFIX}currency`
	}
);
