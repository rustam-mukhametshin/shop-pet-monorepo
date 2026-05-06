import {Request, Response} from 'express';
import {Product} from "../models/product.model";
import {ObjectId} from "mongodb";
import {validationResult} from "express-validator";

export const getAddProduct = (req: Request, res: Response): void => {
    res.render('admin/edit-product', {
        pageTitle: 'Add product',
        url: '/admin/add-product',
        edit: false,
        product: undefined,
        errorMessage: undefined,
    });
};

export const postAddProduct = (req: Request, res: Response, next: any): any => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors.array());
        // req.flash('error', [errors.array()[0].msg]);
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add product',
            url: '/admin/add-product',
            edit: false,
            product: undefined,
            errorMessage: [errors.array()[0].msg],
        });
    }

    const {title, imageUrl, description, price} = req.body as {
        title: string;
        imageUrl: string;
        description: string;
        price: string;
    };

    return new Product({
        title,
        imageUrl,
        description,
        price: parseFloat(price),
        userId: req.user,
    })
        .save()
        .then(() => res.redirect('/admin/products'))
        .catch((err: any) => {
            throw new Error(err);
        });
};

export const getProducts = (req: Request, res: Response): Promise<void> => {
    return Product.find({
        userId: new ObjectId(req.user.id),
    })
        .populate('userId', 'name')
        .then((products) => {
            res.render('admin/products', {
                pageTitle: 'Admin Products',
                url: '/admin/products',
                prods: products,
            });
        })
        .catch((err: any) => {
            throw new Error(err);
        });
};


export const getEditProduct = (req: Request, res: Response): Promise<void> => {
    const edit = req.query['edit'] === 'true';
    const prodId = req.params['id'] as string;

    return Product.findById(prodId)
        .then((product) => {
            if (!product) {
                res.status(404).redirect('/admin/products');
                return;
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit product',
                url: '/admin/edit-product',
                edit,
                product,
            });
        })
        .catch((err: any) => {
            throw new Error(err);
        });
};

export const postEditProduct = (req: Request, res: Response): Promise<void> => {
    const id = ((req.params['id'] as string) || (req.body.id as string));
    const {title, description, price, imageUrl} = req.body as {
        title: string;
        description: string;
        price: string;
        imageUrl: string;
    };

    return Product.findById(id)
        .then((product) => {

            if (!product) throw new Error('Product not found');

            if (product?.userId?.toString() !== req.user.id.toString()) {
                return res.redirect('/');
            }

            product.title = title;
            product.description = description;
            product.price = parseFloat(price);
            product.imageUrl = imageUrl;
            return product.save().then(() => res.redirect('/admin/products'))
        })
        .catch((err: any) => {
            throw new Error(err);
        });
};


export const deleteProduct = (req: Request, res: Response): Promise<void> => {
    const productId = req.params['id'] as string;

    return Product.deleteOne({
        _id: productId,
        userId: req.user.id,
    })
        .then((product) => {
            if (!product) {
                throw new Error('Product not found');
            }
            return product;
        })
        .then(() => res.redirect('/admin/products'))
        .catch((err: any) => {
            throw new Error(err);
        });
};






