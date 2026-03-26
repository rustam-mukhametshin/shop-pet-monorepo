import { Request, Response } from 'express';
import Product from '../models/product.model';
import { CartModel } from '../models/cart.model';

export const getIndex = (req: Request, res: Response): Promise<void> => {
    return Product.findAll().then((products) => {
        res.render('shop/index', {
            pageTitle: 'Shop',
            url: '/',
            prods: products,
        });
    });
};

export const getProducts = (req: Request, res: Response): Promise<void> => {
    return Product.findAll().then((products) => {
        res.render('shop/product-list', {
            pageTitle: 'Products',
            url: '/products',
            prods: products,
        });
    });
};

export const getProduct = (req: Request, res: Response): Promise<void> => {
    return Product.findByPk(req.params['id'] as string).then((product) => {
        res.render('shop/product-detail', {
            pageTitle: product?.title ?? 'Product',
            url: '/products',
            product,
        });
    });
};

export const getCart = (req: Request, res: Response): void => {
    CartModel.getCart((cart) => {
        Product.findAll().then((products) => {
            const cartProducts = products
                .filter((p) => cart.products.some((cp) => cp.id === p.id))
                .map((p) => ({
                    productData: p,
                    quantity: cart.products.find((cp) => cp.id === p.id)!.quantity,
                }));

            res.render('shop/cart', {
                pageTitle: 'Cart',
                url: '/cart',
                cart,
                products: cartProducts,
            });
        });
    });
};

export const postCart = (req: Request, res: Response): Promise<void> => {
    const id = req.body.id as string;
    return Product.findByPk(id as string)
        .then((product) => CartModel.addProduct(id, req.user.id, product!))
        .then(() => res.redirect('/'));
};

export const deleteItem = (req: Request, res: Response): Promise<void> => {
    const id = req.params['id'] as string;
    return Product.findByPk(id as string).then((product) => {
        CartModel.deleteProduct(id, product!.price);
        res.redirect('/cart');
    });
};

export const getOrders = (req: Request, res: Response): Promise<void> => {
    return Product.findAll().then((products) => {
        res.render('shop/orders', {
            pageTitle: 'Orders',
            url: '/orders',
            prods: products,
        });
    });
};

export const getCheckout = (req: Request, res: Response): Promise<void> => {
    return Product.findAll().then((products) => {
        res.render('shop/checkout', {
            pageTitle: 'Checkout',
            url: '/checkout',
            prods: products,
        });
    });
};




