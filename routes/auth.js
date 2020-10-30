const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login', 
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail(),
        body('password', 'Incorrect email/password combination')
            .isLength({min: 8})
            .trim(),

    ],
    authController.postLogin
);

router.post(
    '/signup', 
    [
        // validation for sign up email
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            // Check if user email already exists
            .custom((value, {req}) => {
                return User.findOne({email: value})
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject('Email already exists');
                        }
                    });
            })
            .normalizeEmail(),
        // validation for sign up password, specifically in req body
        body(
            'password',
            'Password must contain at least 8 characters'
        )
            .isLength({min: 8})
            .withMessage()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords Do Not Match');
                }
                return true;
            })
            
    ],
    authController.postSignup
    
);

router.post('/logout', authController.postLogout);

router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

router.get('/reset-password/:token', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);


module.exports = router;