import {NextFunction, Request, Response} from 'express';
import {Product} from "../models/product.model";
import {ObjectId} from "mongodb";
import {validationResult} from "express-validator";
import fs from "node:fs";

export const postAddProduct = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json( {
            edit: false,
            product: undefined,
            errorMessage: [errors.array()[0].msg],
        });
    }

    const image = req.file;
    const {title, description, price} = req.body as {
        title: string;
        description: string;
        price: string;
    };

    if (!image) {
        return res.status(422).json( {
            edit: false,
            product: undefined,
            errorMessage: 'Attached file is not an image',
        });
    }

    const imageUrl = image.path;

    return new Product({
        title,
        imageUrl,
        description,
        price: parseFloat(price),
        userId: req.user,
    })
        .save()
        .catch((err: any) => next(new Error(err)));
};

export const getProducts = (req: Request, res: Response, next: NextFunction) => {
    return Product.find({
        userId: new ObjectId(req?.user?.id),
    })
        .populate('userId', 'name')
        .then((products) => {
            return res.json( {
                prods: products,
            });
        })
        .catch((err: any) => next(new Error(err)));
};

export const postEditProduct = (req: Request, res: Response, next: NextFunction) => {
    const id = ((req.params['id'] as string) || (req.body.id as string));
    const image = req.file;
    const {title, description, price} = req.body as {
        title: string;
        description: string;
        price: string;
    };

    return Product.findById(id)
        // @ts-ignore
        .then((product) => {

            if (!product) throw new Error('Product not found');

            if (product?.userId?.toString() !== req.user.id.toString()) {
                return res.redirect('/');
            }

            if (image) {
                fs.unlink(product.imageUrl, err => {
                    if (err) throw err;
                })
                product.imageUrl = image.path;
            }

            product.title = title;
            product.description = description;
            product.price = parseFloat(price);
            return product.save()
        })
        .catch((err: any) => next(new Error(err)));
};


export const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params['id'] as string;
    return Product.findById(productId)
        .then((product) => {
            if (!product) {
                next(new Error('Product not found'));
            }
            // deleteFile(product?.imageUrl);

            // return Product.deleteOne({
            //     _id: productId,
            //     userId: req.user.id,
            // })
            return 'OK';
        })
        .then(() => {
            // res.redirect('/admin/products')
            return res
                .status(204)
                .json({message: 'Success'});
        })
        .catch((err: any) => next(new Error(err)));
};






