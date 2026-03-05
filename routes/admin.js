const express = require('express');
const ProductController = require('../controllers/product.controller');

const adminRoutes = express.Router();


adminRoutes.get('/add-product', ProductController.getAddProduct)

adminRoutes.post('/add-product', ProductController.postAddProduct)

exports.adminRoutes = adminRoutes;