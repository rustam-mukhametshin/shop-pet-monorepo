const express = require('express');
const ProductController = require("../controllers/product.controller");
const shopRoutes = express.Router();


shopRoutes.get('/products', ProductController.getProducts)
shopRoutes.get('/', ProductController.getHomepage)

module.exports = shopRoutes;
