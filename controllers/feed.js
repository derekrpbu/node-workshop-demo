const fs = require('fs')
const path = require('path')

const { validationResult } = require('express-validator')
const Post = require('../models/post')
const User = require('../models/user')

exports.getPosts = (req, res, next) => {

    // Count documents for pagination
    Post.find().countDocuments()
        .then(count => {
            totalItems = count
            return Post.find()
        })
        .then(posts => {
            res.status(200).json({
                message: "Posts fetched!",
                posts: posts,
                totalItems: totalItems
            }) 
        })
        .catch(err => {   // Promise not fullfilled
            if(!err.statusCode){
                err.statusCode = 500;
            }
            // throw err does not work inside a promise for that we use next()
            next(err)
        })
};

exports.createPost = (req,res,next) => {

    // validation user
    const errors = validationResult(req);   // This extracts errors gathered

    // Using Error object
    if(!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect") // Error Object
        error.statusCode = 422    // set custom Error porperty
        throw error   // Exit function execution and reach next error handling Middleware provided
    }

    let creator;

    // Create post in db
    // We us 'Post' model as constructor, we pass js Object
    // Mongoose will create _id and timestamp automatically
    const post = new Post({ 
        title: req.body.title, 
        content: req.body.content,
        //imageUrl: req.file.path,
        creator: req.userId
    })

    post
        .save()   // Save to db, returns promise
        .then(result => {
            return User.findById(req.userId)
        })
        .then(user => {
            creator = user
            user.posts.push(post)   //save post on User's posts
            return user.save()
        })
        .then( result => {
            res.status(201).json({
                message: "Post created successfully!",
                post: post,
                creator: { _id: creator._id, name: creator.name}
            })
        })
        .catch(err => { 
            if(!err.statusCode){
                err.statusCode = 500;
            }
            // throw err does not work inside a promise for that we use next()
            next(err)
        })
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if(!post){
                const error = new Error('Could not find post.')
                error.statusCode = 404
                throw error   // CONFUSING we only use thow here (async) so catch block is reached (not Middleware), but we reach catch with a defined status of 404
            }
            res.status(200).json({
                message: "Post fetched!",
            post: post
            })  
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            // throw err does not work inside a promise for that we use next()
            next(err)
        })
};

exports.updatePost = (req, res, next) => {

    // validation user
    const errors = validationResult(req);

    // Using Error object
    if(!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect")
        error.statusCode = 422
        throw error
    }

    Post.findById(req.params.postId)  // Once we know is valid data we update in DB
        .then(post => {
            if(!post){
                const error = new Error('Could not find post.')
                error.statusCode = 404
                throw error
            }
            
            // Validate user logged
            if(post.creator.toString() !== req.userId){
                const error = new Error('Not authorized!')
                error.statusCode = 403
                throw error
            }

            post.title = req.body.title
            post.content = req.body.content
            return post.save()
        })
        .then(result => {
            res.status(200).json({ message: "Post updated", post: result})
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
};

exports.deletePost = (req, res, next) => {
    
    Post.findById(req.params.postId)
        .then(post => {
            if(!post){
                const error = new Error('Could not find post.')
                error.statusCode = 404
                throw error
            }

            // Validate user logged
            if(post.creator.toString() !== req.userId){
                const error = new Error('Not authorized!')
                error.statusCode = 403
                throw error
            }

            return Post.findByIdAndDelete(req.params.postId)
        })
        .then(result => {
            return User.findById(req.userId)
        })
        .then(user => {
            //Clearing relations
            user.posts.pull(req.params.postId);
            return user.save();
        })
        .then(result => {
            res.status(200).json({ message: "Post deleted.", post: result})
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}