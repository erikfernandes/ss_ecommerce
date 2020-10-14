const path = require('path');

const express = require('express');

// Controller imports
const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product ==> GET
router.get('/add-product', adminController.getAddProduct);

// /admin/add-product ==> POST
router.post('/add-product', adminController.postAddProduct);

router.get('/all-products', adminController.getProducts);

module.exports = router;
