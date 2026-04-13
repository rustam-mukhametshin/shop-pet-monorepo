import {Request, Response} from 'express';
import {Product} from '../models/product.model';
import {UserModel} from "../models/user.model";
import {OrderModel} from "../models/order.model";

export const getIndex = (req: Request, res: Response): Promise<void> => {
    return Product.find().then((products) => {
        res.render('shop/index', {
            pageTitle: 'Shop',
            url: '/',
            prods: products,
            isLoggedIn: req.session.isLoggedIn || false
        });
    });
};

export const getProducts = (req: Request, res: Response): Promise<void> => {
    return Product
        .find()
        .populate('userId')
        .then((products) => {
            res.render('shop/product-list', {
                pageTitle: 'Products',
                url: '/products',
                prods: products,
                isLoggedIn: req.session.isLoggedIn || false
            });
        });
};

export const getProduct = (req: Request, res: Response): Promise<void> => {
    return Product.findById(req.params['id'] as string)
        .then((product) => {
            res.render('shop/product-detail', {
                pageTitle: product?.title ?? 'Product',
                url: '/products',
                product,
                isLoggedIn: req.session.isLoggedIn || false
            });
        });
};

export const getCart = (req: Request, res: Response): Promise<unknown> => {
    return UserModel.findById(req.user._id).populate({
        path: 'cart.items.productId',
        model: 'Product',
    })
        .select('cart')
        .then((user: any) => {
            return res.render('shop/cart', {
                pageTitle: 'Cart',
                url: '/cart',
                cart: user.cart,
                products: user.cart.items,
                isLoggedIn: req.session.isLoggedIn || false
            });
        })
        .catch((err: any) => console.error(err));
};

export const postCart = (req: Request, res: Response): Promise<void> => {
    const productId = req.body.id as string;
    return Product.findById(productId)
        .then(product => req.user.addToCart(product))
        .then(() => res.redirect('/cart'))
        .catch((err: any) => console.error(err));
};

export const postCartDeleteProduct = (req: Request, res: Response) => {
    return req.user
        .deleteProductFromCart(req.params['id'])
        .then(() => res.redirect('/cart'))
        .catch((err: any) => console.error(err));
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    return OrderModel
        .find({
            'userId': req.user._id
        })
        .populate({
            path: 'products.product',
            model: 'Product',
        })
        .then((orders: any[]) => {
            return res.render('shop/orders', {
                pageTitle: 'Orders',
                url: '/orders',
                orders: orders,
                isLoggedIn: req.session.isLoggedIn || false
            });
        })

};

export const postCreateOrder = async (req: Request, res: Response) => {
    return UserModel.findById(req.user._id).populate({
        path: 'cart.items.productId',
        model: 'Product',
    })
        .select('cart')
        .then(_ => {
            const order = new OrderModel({
                products: req.user.cart.items.map((item: any) => {
                    return {
                        quantity: item.quantity,
                        product: item.productId,
                    }
                }),
                userId: req.user
            });

            return order.save();
        })
        .then(_ => req.user.clearCart())
        .then(() => {
            return OrderModel
                .find({
                    where: {
                        userId: req.user.id,
                    }
                })
                .populate('userId')
                .populate({
                    path: 'items.productId',
                    model: 'Product',
                }).then((orders: any) => {
                    return res.render('shop/orders', {
                        pageTitle: 'Orders',
                        url: '/orders',
                        orders: orders,
                        isLoggedIn: req.session.isLoggedIn || false
                    });
                })
        })
        .catch((err: any) => console.error(err));
};

export const postDeleteOrderItem = (req: Request, res: Response): Promise<void> => {
    const { productId, orderId } = req.body as { productId: string; orderId: string };
    return req.user
        .deleteProductFromOrder(productId, orderId)
        .then(() => res.redirect('/orders'))
        .catch((err: any) => console.error(err));
};
