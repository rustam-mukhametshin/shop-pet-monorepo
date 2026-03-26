const ProductModel = require("../models/product.model");
const {CartModel} = require("../models/cart.model");

exports.getIndex = (req, res) => {
    return ProductModel.findAll().then(products => {
        return res.render('shop/index', {
            pageTitle: 'Shop',
            url: '/',
            prods: products
        })
    });
}

exports.getProducts = (req, res) => {
    return ProductModel.findAll().then(products => {
        return res.render('shop/product-list', {
            pageTitle: 'Products',
            url: '/products',
            prods: products
        })
    });
}

exports.getProduct = (req, res) => {
    return ProductModel.findByPk(req.params.id).then(product => {
        return res.render('shop/product-detail', {
            pageTitle: product.title ?? 'Product',
            url: '/products',
            product,
        })
    });
}

exports.getCart = (req, res) => {
    return CartModel.getCart((cart) => {
        ProductModel.findAll().then(products => {
            let cartProducts = [];
            for (const product of products) {
                const pData = cart.products.find((p) => p.id === product.id);
                if (pData) {
                    cartProducts.push({
                        productData: product,
                        quantity: pData.quantity,
                    });
                }
            }


            return res.render('shop/cart', {
                pageTitle: 'Cart',
                url: '/cart',
                cart,
                products: cartProducts,
            })
        })
    });
}

exports.postCart = (req, res) => {
    const id = req.body.id;
    return ProductModel.findByPk(id)
        .then(product => CartModel.addProduct(id, req.user.id, product))
        .then(() => res.redirect('/'))
}

exports.deleteItem = (req, res) => {
    const id = req.params.id;

    return ProductModel.findByPk(id).then(product => {
        CartModel.deleteProduct(id, product.price);
        return res.redirect('/cart');
    })
}

exports.getOrders = (req, res) => {
    return ProductModel.findAll().then(products => {
        return res.render('shop/orders', {
            pageTitle: 'Orders',
            url: '/orders',
            prods: products
        })
    });
}

exports.getCheckout = (req, res) => {
    return ProductModel.findAll().then(products => {
        return res.render('shop/checkout', {
            pageTitle: 'Checkout',
            url: '/checkout',
            prods: products
        })
    });
}