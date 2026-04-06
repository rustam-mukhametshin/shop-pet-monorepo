import {BaseModel} from "./base.model";
import {ObjectId} from "mongodb";
import {Product} from "./product.model";

export class UserModel extends BaseModel {
    private readonly email: string;
    private readonly username: string;
    private cart: {
        items: {
            productId: any;
            quantity: number;
        }[],
    };
    id: ObjectId;

    static readonly collectionName = 'users';
    readonly collectionName = 'users';

    constructor(username: string, email: string, cart: any, id: ObjectId) {
        super();
        this.email = email;
        this.username = username;
        this.cart = cart; // {items: [],}
        this.id = id;
    }

    save() {
        return UserModel.collection(UserModel.collectionName)
            .insertOne({
                email: this.email,
                username: this.username,
            });
    }

    static findByPk(id: string) {
        return UserModel.collection(this.collectionName)
            .find({
                _id: new ObjectId(id),
            })
            .next()
            .then((data: any) => ({
                ...data,
                id: data._id.toString(),
            }))
    }

    addToCart(product: any) {
        let cartProductIndex = -1;
        if (this.cart?.items && this.cart.items.length > 0) {
            cartProductIndex = this.cart.items.findIndex(prod => {
                return prod.productId.toString() == product.id;
            });
        } else {
            this.cart = {
                items: [],
            };
        }

        if (cartProductIndex > -1) {
            this.cart.items[cartProductIndex].quantity += 1;
        } else {
            this.cart.items.push({
                productId: new ObjectId(product.id),
                quantity: 1,
            })
        }

        return this.getCollection()
            .updateOne(
                {_id: this.id,},
                {
                    $set: {cart: this.cart},
                }
            )
    }

    async getCart() {
        const ids = this.cart.items.map(item => new ObjectId(item.productId))

        return Product.findAllByIds(ids)
            .then((products: any[]) => {
                this.cart.items = this.cart.items.map(item => {
                    return {
                        quantity: item.quantity,
                        ...products.find((prod: any) => prod.id.toString() === item.productId.toString()),
                    };
                })
                return this.cart;
            })
    }
}