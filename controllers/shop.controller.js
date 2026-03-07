const ProductModel = require("../models/product.model");

exports.getHomepage = (req, res) => {
    return ProductModel.getAll((products) => {
        return res.render('shop/index', {
            pageTitle: 'Shop page',
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