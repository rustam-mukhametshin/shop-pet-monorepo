import {Request, Response} from 'express';
import {Product} from '../models/product.model';


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

export const getCart = (req: Request, res: Response): Promise<unknown> => {
    return req.user
        .getCart()
        .then((cart: any) => {
            return res.render('shop/cart', {
                pageTitle: 'Cart',
                url: '/cart',
                cart,
                products: cart.items,
            });
        })
        .catch((err: any) => console.error(err));
};

export const postCart = (req: Request, res: Response): Promise<void> => {
    const productId = req.body.id as string;
    return Product.findByPk(productId)
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

// export const getOrders = async (req: Request, res: Response): Promise<void> => {
//     const orders = await req.user.getOrders({
//         include: ['orderItems']
//     })
//     res.render('shop/orders', {
//         pageTitle: 'Orders',
//         url: '/orders',
//         orders: orders,
//     });
// };

// export const postCreateOrder = async (req: Request, res: Response): Promise<void> => {
//     const cart = await req.user.getCart();
//     if (!cart) {
//         return res.redirect('/cart');
//     }
//
//     const products = await cart.getCartProducts();
//     // @ts-ignore
//     const order = await req.user.createOrder();
//
//     await order.addOrderItems(
//         products.map((product: any) => {
//             product.orderItem = {
//                 quantity: product.cartItem.quantity,
//             };
//             return product;
//         })
//     );
//
//     // Association alias is `cartProducts`, so the generated setter is `setCartProducts`.
//     // @ts-ignore
//     await cart.setCartProducts([]);
//
//     return res.render('shop/orders', {
//         pageTitle: 'Orders',
//         url: '/orders',
//         prods: products,
//     });
// };