const express = require('express');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use('/', (req, res, next) => {
    next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
    return res
        .status(404)
        .sendFile(path.join(__dirname, 'views', '404.html'));
})

app.listen(3000);
