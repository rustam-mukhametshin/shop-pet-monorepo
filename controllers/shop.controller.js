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

exports.getCart = (req, res) => {
    return ProductModel.getAll((products) => {
        return res.render('shop/cart', {
            pageTitle: 'Cart',
            url: '/cart',
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