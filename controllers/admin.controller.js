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
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price
    return ProductModel.create(
        {
            title,
            description,
            price,
            imageUrl,
        }
    ).then(() => {
        return res.redirect('/admin/products');
    })
        .catch((err) => {
            console.error('Error: ', err);
            return res.status(500).redirect('/admin/products');
        });
}

exports.getEditProduct = (req, res) => {
    const edit = req.query.edit === 'true';
    const prodId = req.params.id;
    return ProductModel.findByPk(prodId).then((product) => {
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
    return ProductModel.findByPk(req.params.id || req.body.id).then((product) => {
        product.title = req.body.title;
        product.description = req.body.description;
        product.price = req.body.price;
        product.imageUrl = req.body.imageUrl;
        return product.save()
    })
        .then(() => res.redirect('/admin/products'))
        .catch((err) => {
            console.error(err);
            return res.status(500).redirect('/admin/products');
        });
}

exports.getProducts = (req, res) => {
    return ProductModel.findAll()
        .then(products => {
            return res.render('admin/products', {
                pageTitle: 'Admin Products',
                url: '/admin/products',
                prods: products
            })
        });
}