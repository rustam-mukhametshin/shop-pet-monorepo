const ProductModel = require("../models/product.model");

exports.getIndex = (req, res) => {
    return ProductModel.getAll((products) => {
        return res.render('shop/index', {
            pageTitle: 'Shop',
            url: '/',
            prods: products
        })
    });
}

exports.getProducts = (req, res) => {
    return ProductModel.getAll((products) => {
        return res.render('shop/product-list', {
            pageTitle: 'Products',
            url: '/products',
            prods: products
        })
    });
}

exports.getProductDetails = (req, res) => {
    return ProductModel.findById((product) => {
        return res.render('shop/product-detail', {
            pageTitle: product.title ?? 'Product',
            url: '/products',
            product,
        })
    }, req.params.id);
}

exports.getCart = (req, res) => {
    return ProductModel.getAll((products) => {
        return res.render('shop/cart', {
            pageTitle: 'Cart',
            url: '/cart',
            prods: products
        })
    });
}

exports.getOrders = (req, res) => {
    return ProductModel.getAll((products) => {
        return res.render('shop/orders', {
            pageTitle: 'Orders',
            url: '/orders',
            prods: products
        })
    });
}

exports.getCheckout = (req, res) => {
    return ProductModel.getAll((products) => {
        return res.render('shop/checkout', {
            pageTitle: 'Checkout',
            url: '/checkout',
            prods: products
        })
    });
}