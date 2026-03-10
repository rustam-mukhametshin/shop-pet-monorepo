const ProductModel = require("../models/product.model");

exports.getAddProduct = (req, res) => {
    return res.render('admin/edit-product', {
        pageTitle: 'Add product',
        url: '/admin/add-product',
        edit: false,
        product: undefined,
    })
}

exports.postAddProduct = (req, res) => {
    const product = new ProductModel(
        null,
        req.body.title,
        req.body.imageUrl,
        req.body.description,
        req.body.price
    );
    product.save();
    res.redirect('/');
}

exports.getEditProduct = (req, res) => {
    const edit = req.query.edit === 'true';
    const prodId = req.params.id;
    return ProductModel.findById((product) => {
        if (!product) {
            return res.status(404).redirect('/admin/products');
        }

        return res.render('admin/edit-product', {
            pageTitle: 'Edit product',
            url: '/admin/edit-product',
            edit,
            product,
        })
    }, prodId);
}

exports.postEditProduct = (req, res) => {
    const product = new ProductModel(
        req.body.id,
        req.body.title,
        req.body.imageUrl,
        req.body.description,
        req.body.price
    );
    product.save();
    res.redirect('/admin/products');
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