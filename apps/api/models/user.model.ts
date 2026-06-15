import mongoose, {Model} from "mongoose";

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
    status: {
        type: String,
        required: true,
        default: 'active',
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

userSchema.statics.isValidEmail = function (email: string): boolean {
    return /^\S+@\S+\.\S+$/.test(email);
};

userSchema.statics.isPasswordLengthIsOk = function (password: string): boolean {
    return password.length <= 72;
};

userSchema.statics.getUserByEmail = async function (email: string) {
    return UserModel.findOne({email: email})
};

userSchema.statics.isUserExistByEmail = async function (email: string) {
    return UserModel.findOne({email: email}).then(user => !!user)
};

export const UserModel = mongoose.model<any, UserModelStatic>('User', userSchema);

type UserModelStatic = Model<any> & {
    isValidEmail(email: string): boolean;
    isPasswordLengthIsOk(password: string): boolean;
    getUserByEmail(email: string): Promise<any>;
    isUserExistByEmail(email: string): Promise<boolean>;
};
