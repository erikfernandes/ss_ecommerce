const path = require('path');

const express = require('express');

// Controller imports
const adminController = require('../controllers/admin');

// Route authentication middleware
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product ==> GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product ==> POST
router.post('/add-product', isAuth, adminController.postAddProduct);

router.get('/all-products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
