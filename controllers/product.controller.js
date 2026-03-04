exports.getAddProduct = (req, res, next) => {
    return res.render('add-product', {
        pageTitle: 'Add product GET',
        url: '/admin/add-product',
    })
}