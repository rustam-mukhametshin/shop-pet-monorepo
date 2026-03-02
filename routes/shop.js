const express = require('express');
const path = require('path');
const shopRoutes = express.Router();
const {products} = require('./admin');


shopRoutes.get('/', (req, res, next) => {
    console.log(products);
    res.sendFile(path.join(__dirname, '../', 'views', 'shop.html'));
})

module.exports = shopRoutes;
