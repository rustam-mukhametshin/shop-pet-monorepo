const express = require('express');
const ShopController = require("../controllers/shop.controller");
const shopRoutes = express.Router();


shopRoutes.get('/products', ShopController.getProducts)
shopRoutes.get('/cart', ShopController.getHomepage)
shopRoutes.get('/checkout', ShopController.getHomepage)
shopRoutes.get('/', ShopController.getHomepage)

module.exports = shopRoutes;
