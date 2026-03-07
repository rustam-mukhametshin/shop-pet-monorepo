const ProductModel = require("../models/product.model");

exports.getAddProduct = (req, res, next) => {
    return res.render('admin/add-product', {
        pageTitle: 'Add product GET',
        url: '/admin/add-product',
    })
}

exports.postAddProduct = (req, res, next) => {
    const product = new ProductModel(req.body.title);
    product.save();
    res.redirect('/');
}

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