import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../util/database';

export interface ProductAttributes {
    id: number;
    title: string;
    price: number;
    imageUrl: string;
    description: string;
    userId?: number | null;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id'> {}

class Product
    extends Model<ProductAttributes, ProductCreationAttributes>
    implements ProductAttributes
{
    declare id: number;
    declare title: string;
    declare price: number;
    declare imageUrl: string;
    declare description: string;
    declare userId: number | null;
}

Product.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        title: DataTypes.STRING,
        price: { type: DataTypes.DOUBLE, allowNull: false },
        imageUrl: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, modelName: 'product' }
);

export default Product;

