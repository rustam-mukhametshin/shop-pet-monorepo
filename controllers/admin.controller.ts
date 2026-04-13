import {Request, Response} from 'express';
import {Product} from "../models/product.model";

export const getAddProduct = (req: Request, res: Response): void => {
    res.render('admin/edit-product', {
        pageTitle: 'Add product',
        url: '/admin/add-product',
        edit: false,
        product: undefined,
        isLoggedIn: req.session.isLoggedIn || false,
    });
};

export const postAddProduct = (req: Request, res: Response): any => {
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
        userId: req.user._id,
    })
        .save()
        .then(() => res.redirect('/admin/products'))
        .catch((err: unknown) => {
            console.error('Error: ', err);
            res.status(500).redirect('/admin/products');
        });
};

export const getProducts = (req: Request, res: Response): Promise<void> => {
    return Product.find()
        .then((products) => {
            res.render('admin/products', {
                pageTitle: 'Admin Products',
                url: '/admin/products',
                prods: products,
                isLoggedIn: req.session.isLoggedIn || false,
            });
        }).catch((err: unknown) => {
            console.error('Error: ', err);
        })
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
                isLoggedIn: req.session.isLoggedIn || false,
            });
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
            product.title = title;
            product.description = description;
            product.price = parseFloat(price);
            product.imageUrl = imageUrl;

            return product.save()
        })
        .then(() => res.redirect('/admin/products'))
        .catch((err: unknown) => {
            console.error(err);
            res.status(500).redirect('/admin/products');
        });
};


export const deleteProduct = (req: Request, res: Response): Promise<void> => {
    const productId = req.params['id'] as string;

    return Product.findByIdAndDelete(productId)
        .then((product) => {
            if (!product) {
                throw new Error('Product not found');
            }
            return product;

            // return UserModel.removeProductFromAllOrders(productId);
        })
        // .then(() => UserModel.removeProductFromAllCarts(productId))
        // .then(() => Product.deleteProduct(productId))
        .then(() => res.redirect('/admin/products'))
        .catch((err: unknown) => console.error('Error: ', err)) as Promise<void>;
};






