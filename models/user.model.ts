import {BaseModel} from "./base.model";
import {ObjectId} from "mongodb";

export class UserModel extends BaseModel {
    private readonly email: string;
    private readonly username: string;
    private readonly cart: {
        items: { _id: string }[],
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
        // const cartProduct = this.cart.items.findIndex(prod => {
        //     return prod._id == product.id;
        // });

        const updatedCart = {
            items: [{
                productId: new ObjectId(product.id),
                quantity: 1,
            }]
        };

        return this.getCollection()
            .updateOne(
                {_id: this.id,},
                {
                    $set: {cart: updatedCart},
                }
            )
    }

    async getCart(){
        return this.getCollection()
            .findOne({_id: this.id})
            .then(user => user?.cart);
    }
}