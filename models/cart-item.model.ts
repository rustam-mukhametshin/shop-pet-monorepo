import sequelize from "../util/database";
import {DataTypes, Model} from "sequelize";

export const CartItem = sequelize.define<Model<any, any>>(
    'cartItem',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
        }
    }
);