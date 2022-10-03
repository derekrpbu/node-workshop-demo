const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config();

const app = express()

const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')

app.use(bodyParser.json()) // for application/json

// Used to handle CORS Error
app.use((req,res, next) => {
    res.setHeader('Access-Control-Allow-Origin','*') // allow different servers comunication
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
}) 

app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)

// every time an error is thrown or forward by next function
app.use((error, req, res, next) => {
    console.log(error)
    res.status(error.statusCode || 500).json({message: error.message, data: error.data})
})

const port = 8080;
let mongo_url = process.env.MONGO_URL;
mongoose
    .connect(mongo_url)
    .then(console.log('Connected to DB'), app.listen(port), console.log('Server listening on port ' + port))
    .catch(err => {console.log(err)})
