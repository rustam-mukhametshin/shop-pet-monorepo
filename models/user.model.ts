import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../util/database';

export interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    zipCode?: string | null;
    country?: string | null;
    role: 'user' | 'admin';
    isActive: boolean;
}

interface UserCreationAttributes
    extends Optional<
        UserAttributes,
        | 'id'
        | 'firstName'
        | 'lastName'
        | 'phone'
        | 'address'
        | 'city'
        | 'zipCode'
        | 'country'
        | 'isActive'
    > {}

class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes
{
    declare id: number;
    declare username: string;
    declare email: string;
    declare password: string;
    declare firstName: string | null;
    declare lastName: string | null;
    declare phone: string | null;
    declare address: string | null;
    declare city: string | null;
    declare zipCode: string | null;
    declare country: string | null;
    declare role: 'user' | 'admin';
    declare isActive: boolean;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        username: { type: DataTypes.STRING, allowNull: false, unique: true },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        password: { type: DataTypes.STRING, allowNull: false },
        firstName: { type: DataTypes.STRING, allowNull: true },
        lastName: { type: DataTypes.STRING, allowNull: true },
        phone: { type: DataTypes.STRING, allowNull: true },
        address: { type: DataTypes.STRING, allowNull: true },
        city: { type: DataTypes.STRING, allowNull: true },
        zipCode: { type: DataTypes.STRING, allowNull: true },
        country: { type: DataTypes.STRING, allowNull: true },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    { sequelize, modelName: 'user' }
);

export default User;

