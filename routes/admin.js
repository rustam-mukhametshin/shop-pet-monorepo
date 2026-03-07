const express = require('express');
const AdminController = require('../controllers/admin.controller');

const adminRoutes = express.Router();

adminRoutes.get('/add-product', AdminController.getAddProduct)
adminRoutes.post('/add-product', AdminController.postAddProduct)
adminRoutes.get('/products', AdminController.getAddProduct)

module.exports = adminRoutes;