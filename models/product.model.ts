import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
})

export const Product = mongoose.model('Product', productSchema);


// import {BaseModel} from "./base.model";
// import {ObjectId} from "mongodb";
//
//
// export class Product extends BaseModel {
//     collectionName: string = 'products';
//
//     title: string;
//     price: number;
//     imageUrl: string;
//     description: string;
//     userId?: ObjectId;
//
//     constructor(
//         title: string,
//         price: number,
//         imageUrl: string,
//         description: string,
//         userId?: ObjectId
//     ) {
//         super();
//         this.title = title;
//         this.price = price;
//         this.imageUrl = imageUrl;
//         this.description = description;
//         this.userId = userId
//     }
//
//
//
//     static findAllByIds(ids: ObjectId[]) {
//         return Product.collection('products')
//             .find({_id: {$in: ids}})
//             .toArray()
//             .then((products) => {
//                 return products.map((product) => ({
//                     ...product,
//                     id: product._id.toString(),
//                 }));
//             })
//     }
//
//     static findByPk(id: string) {
//         return Product.collection('products')
//             .find({
//                 _id: new ObjectId(id),
//             })
//             .next()
//             .then((data: any) => ({
//                 ...data,
//                 id: data._id.toString(),
//             }))
//     }
//
//     static updateProduct(id: string, product: any) {
//         return Product.collection('products').updateOne(
//             {
//                 _id: new ObjectId(id)
//             },
//             {
//                 $set: product
//             }
//         )
//     }
//
//     static deleteProduct(id: string) {
//         return Product.collection('products')
//             .deleteOne({
//                 _id: new ObjectId(id),
//             })
//     }
// }
