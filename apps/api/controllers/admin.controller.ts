import {NextFunction, Request, Response} from 'express';
import {Product} from "../models/product.model";
import {ObjectId} from "mongodb";
import {validationResult} from "express-validator";
import {deleteFile} from "../util/file";

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

    const image = req.file;
    const {title, description, price} = req.body as {
        title: string;
        description: string;
        price: string;
    };

    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add product',
            url: '/admin/add-product',
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
        .then(() => res.redirect('/admin/products'))
        .catch((err: any) => {
            throw new Error(err);
        });
};

export const getProducts = (req: Request, res: Response): Promise<void> => {
    return Product.find({
        userId: new ObjectId(req?.user?.id),
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
            product.imageUrl = process.env.MAIN_URL! + product.imageUrl;

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
    const image = req.file;
    const {title, description, price} = req.body as {
        title: string;
        description: string;
        price: string;
    };

    return Product.findById(id)
        .then((product) => {

            if (!product) throw new Error('Product not found');

            if (product?.userId?.toString() !== req.user.id.toString()) {
                return res.redirect('/');
            }

            if (image) {
                deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }

            product.title = title;
            product.description = description;
            product.price = parseFloat(price);
            return product.save().then(() => res.redirect('/admin/products'))
        })
        .catch((err: any) => {
            throw new Error(err);
        });
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
        .catch((err: any) => res.status(500).json(err));
};






