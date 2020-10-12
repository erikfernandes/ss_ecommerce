const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// Controller imports
const errorController = require('./controllers/error')

const app = express(); 

// Sets default template engine
app.set('view engine', 'ejs');
app.set('views', 'views')

// Route imports
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

// Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// 404 Page Not Found
app.use(errorController.get404)

app.listen(3000);