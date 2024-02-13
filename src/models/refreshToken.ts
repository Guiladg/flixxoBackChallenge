import User from './user';
import DB from '../DB';
import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';

export default class RefreshToken extends Model<InferAttributes<RefreshToken>, InferCreationAttributes<RefreshToken>> {
	// Attributes
	declare id: CreationOptional<number>;
	declare token: string;
	declare expires: number; // Timestamp w/o ms for expiration date

	// Relationships
	declare userId: ForeignKey<User['id']>;
	declare user: NonAttribute<User>;
}

const sequelize = DB.getInstance();

RefreshToken.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false
		},
		expires: {
			type: DataTypes.BIGINT,
			allowNull: false
		}
	},
	{ sequelize, modelName: 'RefreshToken', tableName: `${process.env.DB_PREFIX}refreshToken` }
);
RefreshToken.belongsTo(User, { as: 'user' });
