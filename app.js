const express = require('express');
const path = require('path');

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');
const {notFound} = require("./controllers/public.controller");
const sequelize = require('./util/database');
const Product = require('./models/product.model');
const User = require('./models/user.model');

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

app.use(notFound)

Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE',
});
User.hasMany(Product);


sequelize.sync()
    .then(() => app.listen(3333))
    .catch(err => console.error(err));
