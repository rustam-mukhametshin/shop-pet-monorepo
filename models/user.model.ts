import {
    DataTypes,
    HasOneCreateAssociationMixin,
    HasOneGetAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyCreateAssociationMixin,
    Model,
    Optional,
} from 'sequelize';
import sequelize from '../util/database';
import type { CartWithProducts } from './cart.model';
import type { OrderWithMixins } from './order.model';

export interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    firstName?: string | null;
    role: 'user' | 'admin';
    isActive: boolean;
}

interface UserCreationAttributes
    extends Optional<
        UserAttributes,
        | 'id'
        | 'firstName'
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
    declare role: 'user' | 'admin';
    declare isActive: boolean;

    // Sequelize association mixins from User.hasOne(Cart)
    declare getCart: HasOneGetAssociationMixin<CartWithProducts>;
    // @ts-ignore
    declare createCart: HasOneCreateAssociationMixin<CartWithProducts, 'userId'>;

    // Sequelize association mixins from User.hasMany(Order)
    declare getOrders: HasManyGetAssociationsMixin<OrderWithMixins>;
    declare createOrder: HasManyCreateAssociationMixin<OrderWithMixins, 'userId'>;
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
