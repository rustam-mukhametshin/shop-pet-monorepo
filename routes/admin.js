const express = require('express');
const path = require('path');

const adminRoutes = express.Router();


adminRoutes.get('/add-product', (req, res, next) => {
    return res.sendFile(path.join(__dirname, '../', 'views', 'add-product.html'));
})

adminRoutes.post('/product', (req, res, next) => {
    res.redirect('/');
})


module.exports = adminRoutes;