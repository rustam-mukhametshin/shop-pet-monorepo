const express = require('express');
const AdminController = require('../controllers/admin.controller');

const adminRoutes = express.Router();

adminRoutes.get('/add-product', AdminController.getAddProduct)
adminRoutes.post('/add-product', AdminController.postAddProduct)
adminRoutes.get('/edit-product/:id', AdminController.getEditProduct)
adminRoutes.post('/edit-product', AdminController.postEditProduct)
adminRoutes.get('/products', AdminController.getProducts)

module.exports = adminRoutes;