const ProductModel = require("../models/product.model");

exports.getAddProduct = (req, res) => {
    return res.render('admin/add-product', {
        pageTitle: 'Add product GET',
        url: '/admin/add-product',
    })
}

exports.postAddProduct = (req, res) => {
    const product = new ProductModel(
        req.body.title,
        req.body.imageUrl,
        req.body.description,
        req.body.price
    );
    product.save();
    res.redirect('/');
}

exports.getProducts = (req, res) => {
    return ProductModel.getAll((products) => {
        return res.render('admin/products', {
            pageTitle: 'Admin Products',
            url: '/admin/products',
            prods: products
        })
    });
}