const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator') // request body validations

const feedController = require('../controllers/feed')
const isAuth = require('../middleware/is-auth')

// GET feed/posts
router.get('/posts', feedController.getPosts)

router.post(
    '/post', isAuth,
    // user validation
    [
        body('title').trim().isLength({min: 5}),
        body('content').trim().isLength({min: 5})
    ],
    feedController.createPost)

router.get('/post/:postId', isAuth, feedController.getPost)

router.put(
    '/post/:postId', isAuth,
    // user validation
    [
        body('title').trim().isLength({min: 5}),
        body('content').trim().isLength({min: 5})
    ],
    feedController.updatePost)

router.delete('/post/:postId', isAuth, feedController.deletePost)

module.exports = router