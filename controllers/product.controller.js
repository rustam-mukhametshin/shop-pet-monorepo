const ProductModel = require("../models/product.model");

exports.getAddProduct = (req, res, next) => {
    return res.render('add-product', {
        pageTitle: 'Add product GET',
        url: '/admin/add-product',
    })
}

exports.postAddProduct = (req, res, next) => {
    const product = new ProductModel(req.body.title);
    product.save();
    res.redirect('/');
}

exports.getProducts = (req, res) => {
    return ProductModel.getAll((products) => {
        return res.render('shop', {
            pageTitle: 'Shop page',
            url: '/',
            prods: products
        })
    });
}