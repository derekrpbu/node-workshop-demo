const express = require('express')
const { body } = require('express-validator')

const User = require('../models/user')
const authController = require('../controllers/auth')

const router = express.Router()

router.put('/signup',
    // Middleware validation
    [ 
        body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        // takes a function an retireve value the one we are looking at
        // and the object which we can get the request as a property
        // returns a promise if the validation 
        .custom( (value, { req }) => {
            return User.findOne({email: value})
                        .then(userDoc => {
                            if(userDoc){
                                return Promise.reject('Email address already exists!');
                            }
                        });
        }).normalizeEmail(),
        body('password').trim().isLength({min:5}),
        body('name').trim().not().isEmpty()
    ],
    authController.signup
);

router.post('/login', authController.login)

module.exports = router;