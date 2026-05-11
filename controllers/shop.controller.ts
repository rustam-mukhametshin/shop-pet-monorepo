import {NextFunction, Request, Response} from 'express';
import {Product} from '../models/product.model';
import {UserModel} from "../models/user.model";
import {OrderModel} from "../models/order.model";
import * as fs from "node:fs";
import path from "path";
import PDFDocument from "pdfkit";

export const getIndex = (req: Request, res: Response): Promise<void> => {
    return Product.find().then((products) => {
        res.render('shop/index', {
            pageTitle: 'Shop',
            url: '/',
            prods: products,
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
            });
        })
        .catch((err: any) => {
            throw new Error(err);
        });
};

export const getProduct = (req: Request, res: Response): Promise<void> => {
    return Product.findById(req.params['id'] as string)
        .then((product) => {
            res.render('shop/product-detail', {
                pageTitle: product?.title ?? 'Product',
                url: '/products',
                product,
            });
        })
        .catch((err: any) => {
            throw new Error(err);
        });
};

export const getCart = (req: Request, res: Response): Promise<unknown> => {
    return UserModel.findById(req?.user).populate({
        path: 'cart.items.productId',
        model: 'Product',
    })
        .select('cart')
        .then((user: any) => {
            if (user && user.cart) {
                return res.render('shop/cart', {
                    pageTitle: 'Cart',
                    url: '/cart',
                    cart: user.cart,
                    products: user.cart.items,
                });
            } else {
                return res.render('shop/cart', {
                    pageTitle: 'Cart',
                    url: '/cart',
                    cart: {},
                    products: [],
                });
            }
        })
        .catch((err: any) => {
            throw new Error(err);
        });
};

export const postAddProductToCart = (req: Request, res: Response): Promise<void> => {
    const productId = req.body.id as string;
    return Product.findById(productId)
        .then(product => req?.user?.addToCart(product))
        .then(() => res.redirect('/cart'))
        .catch((err: any) => {
            throw new Error(err);
        });
};

export const postCartDeleteProduct = (req: Request, res: Response) => {
    return req.user
        .deleteProductFromCart(req.params['id'])
        .then(() => res.redirect('/cart'))
        .catch((err: any) => {
            throw new Error(err);
        });
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    return OrderModel
        .find({
            'userId': req?.user
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
            });
        })
        .catch((err: any) => {
            throw new Error(err);
        });

};

export const postCreateOrder = async (req: Request, res: Response) => {
    return UserModel.findById(req?.user.id).populate({
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
                userId: req.user.id
            });

            return order.save();
        })
        .then(_ => req.user.clearCart())
        .then(() => res.redirect('/orders'))
        .catch((err: any) => {
            throw new Error(err);
        });
};

export const postDeleteOrderItem = (req: Request, res: Response): Promise<void> => {
    const {productId, orderId} = req.body as { productId: string; orderId: string };
    return req.user
        .deleteProductFromOrder(productId, orderId)
        .then(() => res.redirect('/orders'))
        .catch((err: any) => {
            throw new Error(err);
        });
};

export let getInvoice = async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId;

    OrderModel.findById(orderId)
        .populate({
            path: 'products.product',
            model: 'Product',
        })
        .then(order => {
            if (!order) {
                return next(new Error('Not Found'));
            }

            if (order.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }

            const pdfDoc = new PDFDocument();
            const invoice = `invoice-${orderId}.pdf`;
            const invoicePath = path.join('private', 'invoices', invoice);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoice + '"');
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res)

            pdfDoc.fontSize(26).text('Invoice', {
                underline: true,
            });
            pdfDoc.text('-----------------------');
            let totalPrice = 0;
            order.products.forEach((prod: any) => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.text(prod.product.title + ' - ' + prod.quantity + ' x $' + prod.product.price);
            })
            pdfDoc.text('---');
            pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
            pdfDoc.end();

            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         console.error(err);
            //         return next(err);
            //     }
            //

            //     return res.send(data);
            // })
            // const file = fs.createReadStream(invoicePath);
            // res.setHeader('Content-Type', 'application/pdf');
            // res.setHeader('Content-Disposition', 'inline; filename="' + invoice + '"');
            // todo: check bigger files
            // file.pipe(res);

        })
        .catch(err => next(err))

};