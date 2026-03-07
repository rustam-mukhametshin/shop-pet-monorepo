const ProductModel = require("../models/product.model");

exports.getAddProduct = (req, res) => {
    return res.render('admin/add-product', {
        pageTitle: 'Add product GET',
        url: '/admin/add-product',
    })
}

exports.postAddProduct = (req, res) => {
    const product = new ProductModel(req.body.title);
    product.save();
    res.redirect('/');
}