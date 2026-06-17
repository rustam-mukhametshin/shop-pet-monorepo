import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [{
        product: {type: Schema.Types.ObjectId, required: true, ref: "Product"},
        quantity: {type: Number, required: true,}
    }],
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    }
}, {
    timestamps: true
})


export const OrderModel = mongoose.model('Order', orderSchema);