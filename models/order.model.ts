import sequelize from "../util/database";
import {BelongsToManyAddAssociationsMixin, DataTypes, Model} from "sequelize";
import type Product from "./product.model";

export interface OrderWithMixins extends Model<any, any> {
    addOrderItems: BelongsToManyAddAssociationsMixin<Product, number>;
}

export const Order = sequelize.define<OrderWithMixins>(
    'order',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
    }
);