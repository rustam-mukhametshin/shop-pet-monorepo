exports.getAddProduct = (req, res, next) => {
    return res.render('add-product', {
        pageTitle: 'Add product GET',
        url: '/admin/add-product',
    })
}

const products = [];
exports.postAddProduct = (req, res, next) => {
    products.push({
        title: req.body.title,
    })
    res.redirect('/');
}

exports.getProducts = (req, res) => {
    return res.render('shop', {
        pageTitle: 'Shop page',
        url: '/',
        prods: products
    })
}