const express = require('express');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

// Start adding styles
app.use('/css/index.css', (req, res, next) => {
    res
        .setHeader('Content-Type', 'text/css')
        .sendFile(path.join(__dirname, 'css', 'index.css'));
});
// End adding styles

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
