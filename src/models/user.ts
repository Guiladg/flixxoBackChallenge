import * as bcrypt from 'bcryptjs';
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import DB from '../DB';

// Define possible user roles as array (for enum) and as type
export const userRoles = ['admin', 'regular'] as const;
export type UserRole = (typeof userRoles)[number];

export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
	// Attributes
	declare id: CreationOptional<number>;
	declare firstName: CreationOptional<string>;
	declare lastName: CreationOptional<string>;
	declare username: string;
	declare password: string;
	declare role: UserRole;
	declare email: string;

	// Methods
	/** Checks the validity of the `unencryptedPassword` against the one stored. */
	async checkPassword(unencryptedPassword: string): Promise<boolean> {
		return bcrypt.compare(unencryptedPassword, this.password);
	}
}

const sequelize = DB.getInstance();

User.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		firstName: {
			type: DataTypes.STRING(120)
		},
		lastName: {
			type: DataTypes.STRING(120)
		},
		username: {
			type: DataTypes.STRING(20),
			allowNull: false
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
		role: {
			type: DataTypes.ENUM,
			values: userRoles,
			allowNull: false
		},
		email: {
			type: DataTypes.STRING(320),
			allowNull: false
		}
	},

	{
		hooks: {
			// Hash password with bcrypt before creating new users
			beforeCreate: async (user) => {
				user.password = await bcrypt.hash(user.password, 8);
			}
		},
		sequelize,
		modelName: 'User',
		tableName: `${process.env.DB_PREFIX}user`
	}
);
