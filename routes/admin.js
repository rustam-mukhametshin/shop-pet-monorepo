const express = require('express');
const path = require('path');
const rootDir = require('../utils/path');

const adminRoutes = express.Router();


adminRoutes.get('/add-product', (req, res, next) => {
    return res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
})

adminRoutes.post('/add-product', (req, res, next) => {
    res.redirect('/');
})


module.exports = adminRoutes;