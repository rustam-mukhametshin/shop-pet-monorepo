import {BaseModel} from "./base.model";
import {ObjectId} from "mongodb";


export class Product extends BaseModel {
    collectionName: string = 'products';

    title: string;
    price: number;
    imageUrl: string;
    description: string;
    userId?: ObjectId;

    constructor(
        title: string,
        price: number,
        imageUrl: string,
        description: string,
        userId?: ObjectId
    ) {
        super();
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this.userId = userId
    }

    async save() {
        return this.getCollection().insertOne({
            title: this.title,
            price: this.price,
            imageUrl: this.imageUrl,
            description: this.description,
            userId: this.userId
        });
    }

    static findAll() {
        return Product.collection('products').find().toArray()
            .then((products) => {
                return products.map((product) => ({
                    ...product,
                    id: product._id.toString(),
                }));
            })
    }

    static findByPk(id: string) {
        return Product.collection('products')
            .find({
                _id: new ObjectId(id),
            })
            .next()
            .then((data: any) => ({
                ...data,
                id: data._id.toString(),
            }))
    }

    static updateProduct(id: string, product: any) {
        return Product.collection('products').updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: product
            }
        )
    }

    static deleteProduct(id: string) {
        return Product.collection('products')
            .deleteOne({
                _id: new ObjectId(id),
            })
    }
}
