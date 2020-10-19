const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

// Model Imports
const User = require('./models/user');

// Controller imports
const errorController = require('./controllers/error')

// Database import
const mongoConnect = require('./util/database').mongoConnect;

const app = express(); 

// Sets template engine
app.set('view engine', 'ejs');
app.set('views', 'views')

// Route imports
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

// Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// Passes temp user data in requests
app.use((req, res, next) => {
    User.findById('5f8b73bee30bb28cb2f93544')
        .then(user => {
            req.user = new User(user.userName, user.email, user.cart, user._id);
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// 404 Page Not Found
app.use(errorController.get404)

mongoConnect(() => {
    app.listen(3000);
});