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
    return ProductModel.create(
        req.body.title,
        req.body.imageUrl,
        req.body.description,
        req.body.price
    )
        .then(() => {
            return res.redirect('/admin/products');
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).redirect('/admin/products');
        });
}

exports.getEditProduct = (req, res) => {
    const edit = req.query.edit === 'true';
    const prodId = req.params.id;
    return ProductModel.findById(prodId).then((product) => {
        if (!product) {
            return res.status(404).redirect('/admin/products');
        }

        return res.render('admin/edit-product', {
            pageTitle: 'Edit product',
            url: '/admin/edit-product',
            edit,
            product,
        })
    });
}

exports.deleteProduct = (req, res) => {
    return ProductModel.delete(req.params.id, () => {
        return res.redirect('/admin/products');
    })
}

exports.postEditProduct = (req, res) => {
    return ProductModel.update(
        req.body.id,
        req.body.title,
        req.body.imageUrl,
        req.body.description,
        req.body.price
    )
        .then(() => {
            return res.redirect('/admin/products');
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).redirect('/admin/products');
        });
}

exports.getProducts = (req, res) => {
    return ProductModel.getAll().then(products => {
        return res.render('admin/products', {
            pageTitle: 'Admin Products',
            url: '/admin/products',
            prods: products
        })
    });
}