const express = require('express');
const path = require('path');

const {adminRoutes} = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();


app.set('view engine', 'ejs');
// app.set('views', 'views');

// Start public
app.use(express.static(path.join(__dirname, 'public')))
// End public

app.use(express.urlencoded({extended: true}));

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
