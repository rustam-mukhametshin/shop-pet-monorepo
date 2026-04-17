import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    confirmPassword: {
        type: String,
        required: true,
    },
    cart: {
        type: Object,
        required: true,
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "Product",
            },
            quantity: {
                type: Number,
                required: true,
            }
        }],
    }
})

userSchema.methods.addToCart = function (product: any) {
    let cartProductIndex = -1;
    let newObjCart = Object.assign({}, this.cart);

    if (newObjCart?.items && newObjCart.items.length > 0) {
        cartProductIndex = newObjCart.items.findIndex((prod: any) => {
            return prod.productId.toString() == product.id;
        });
    } else {
        newObjCart = {
            items: [],
        };
    }

    if (cartProductIndex > -1) {
        newObjCart.items[cartProductIndex].quantity += 1;
    } else {
        newObjCart.items.push({
            productId: product._id,
            quantity: 1,
        })
    }

    this.cart = newObjCart;
    this.markModified('cart');
    return this.save()
}

userSchema.methods.deleteProductFromCart = function (productId: any) {
    let newObjCart = Object.assign({}, this.cart);

    newObjCart.items = newObjCart.items.filter((prod: any) => prod.productId.toString() !== productId.toString());
    this.cart = newObjCart;
    return this.save()
}

userSchema.methods.clearCart = function () {
    this.cart = {items: []};
    return this.save();
}


export const UserModel = mongoose.model('User', userSchema);