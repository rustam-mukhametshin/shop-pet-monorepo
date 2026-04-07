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

    static removeProductFromAllOrders(productId: string) {
        return UserModel.collection('orders').updateMany(
            {},
            {
                $pull: {
                    items: {
                        id: productId,
                    },
                },
            } as any
        );
    }

    static removeProductFromAllCarts(productId: string) {
        return UserModel.collection(UserModel.collectionName).updateMany(
            {},
            {
                $pull: {
                    'cart.items': {
                        productId: new ObjectId(productId),
                    },
                },
            } as any
        );
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

    async deleteProductFromCart(productId: string) {
        this.cart.items = this.cart.items.filter(prod => prod.productId.toString() !== productId.toString());
        return this.getCollection().updateOne(
            {_id: new ObjectId(this.id)},
            {$set: {cart: this.cart}},
        )
    }

    createOrder() {
        return this.getCart()
            .then(products => {
                const order = {
                    items: products.items,
                    user: {
                        _id: new ObjectId(this.id),
                        name: this.username,
                        email: this.email,
                    },
                }

                return this.getCollection('orders')
                    .insertOne(order)
            })
            .then(insertedOrderDetails => {
                this.cart = {items: []}
                return this.getCollection()
                    .updateOne(
                        {_id: this.id,},
                        {
                            $set: {cart: {items: []}},
                        }
                    )
            })
    }

    getOrders(): Promise<any[]> {
        return this.getCollection('orders')
            .find({"user._id": this.id,})
            .toArray()
    }

    async deleteProductFromOrder(productId: string, orderId?: string) {
        const filter: Record<string, any> = {
            'user._id': this.id,
        };

        if (orderId) {
            filter._id = new ObjectId(orderId);
        }

        return UserModel.collection('orders').updateMany(
            filter,
            {
                $pull: {
                    items: {
                        id: productId,
                    },
                },
            } as any
        );
    }

    async isProductExistInOrder(productId: string) {
        return this.getOrders()
            .then((orders: any) => {
                const length = orders.items.filter((prod: any) => prod.id.toString() !== productId.toString())
                if (length > 0) {
                    return 'yes';
                }
                return 'no';
            })
    }
}