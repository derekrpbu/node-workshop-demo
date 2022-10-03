const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult, Result} = require('express-validator');

const User = require('../models/user');

exports.signup = (req, res, next) => {
   console.log(req.body);

   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      const error = new Error('Validation failed in signup module.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
   }

   const name = req.body.name;
   const email = req.body.email;
   const password = req.body.password;

   //Hashing password
   bcrypt
      .hash(password, 12)
      .then((hashedpwd) => {
         const user = new User({
            email: email,
            password: hashedpwd,
            name: name,
         });
         return user.save();
      })
      .then((result) => {
         res.status(201).json({message: 'User created!', userId: result._id});
      })
      .catch((err) => {
         if (!err.statusCode) {
            err.statusCode = 500;
         }
         // throw err does not work inside a promise for that we use next()
         next(err);
      });
};

exports.login = (req, res, next) => {
   const email = req.body.email;
   const password = req.body.password;

   User.findOne({email: email})
      .then((user) => {
         if (!user) {
            const error = new Error(
               'A user with this email could not be found.'
            );
            error.statusCode = 401;
            throw error;
         }
         loadedUser = user;
         return bcrypt.compare(password, user.password); // return a promise
      })
      .then((isEqual) => {
         if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
         }

         // Generate the token
         const token = jwt.sign(
            {email: loadedUser.email, userId: loadedUser._id.toString()},
            'somesupersecretsecret'
            //{ expiresIn: '1h'}
         );

         res.status(200).json({
            token: token,
            userId: loadedUser._id.toString(),
         });
      })
      .catch((err) => {
         if (!err.statusCode) {
            err.statusCode = 500;
         }
         // throw err does not work inside a promise for that we use next()
         next(err);
      });
};
