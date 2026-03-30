import sequelize from "../util/database";
import {DataTypes, Model} from "sequelize";

export const OrderItem = sequelize.define<Model<any, any>>(
    'orderItem',
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