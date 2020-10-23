const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// Model Imports
const User = require('./models/user');

// Controller imports
const errorController = require('./controllers/error')

const MONGODB_URI = 'mongodb+srv://erik:zADMolQHeaLwcjlY@cluster0.xvm3h.mongodb.net/shop';

const app = express(); 
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});

// Sets template engine
app.set('view engine', 'ejs');
app.set('views', 'views')

// Route imports
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ 
    secret: 'my secret', 
    resave: false, 
    saveUninitialized: false,
    store: store,
 })
);

//Gets a mongoose model user from the session to be used in requests
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// 404 Page Not Found
app.use(errorController.get404)

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Erik',
                    email: 'erik@mail.com',
                    cart: {
                        items: []
                    },
                });
                user.save();
            }
        });
        console.log('Connected!')
        app.listen(3000);
    })
    .catch(err => console.log(err));