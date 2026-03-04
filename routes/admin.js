const express = require('express');
const ProductController = require('../controllers/product.controller');

const adminRoutes = express.Router();

const products = [];


adminRoutes.get('/add-product', ProductController.getAddProduct)

adminRoutes.post('/add-product', (req, res, next) => {
    products.push({
        title: req.body.title,
    })
    res.redirect('/');
})

exports.adminRoutes = adminRoutes;
exports.products = products;