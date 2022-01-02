const express = require('express')
const campsiteRouter = express.Router()
const authenticate = require('../authenticate')
//^^WE WILL USE THIS TO AUTHENTICATE EACH ENPOINT FOR THIS ROUTE OTHER THAN FOR 'GET' REQUESTS SINCE THAT IS READ-ONLY AND WILL NOT EFFECT THE SERVER


const Campsite = require('../models/campsite')

//The full root path is provided within server.js:
//Route chain, one single statement containing each route:
//We no longer have to specify the full full name, it was set for us in server.js and we can reference that as '/'
campsiteRouter.route('/')
    .get((req, res) => {
        Campsite.find()
            .then(campsites => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(campsites)
            })
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        //Mongoose will automatically validate if the req.body from the user is valid according to our Mongoose Schema
        Campsite.create(req.body)
            .then(campsite => {
                console.log('Campsite Created ', campsite)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(campsite)
            })
            .catch(err => next(err))
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /campsites')
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.deleteMany()
            .then(response => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(response)
            })
            .catch(err => next(err))
    })

campsiteRouter.route('/:campsiteId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(campsite)
            })
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.status = 403
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`)
    })
    .put(authenticate.verifyUser, (req, res) => {
        Campsite.findByIdAndUpdate(req.params.campsiteId, {
            $set: req.body
        }, { new: true })
            .then(campsite => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(campsite)
            })
            .catch(err => next(err))
            .delete((req, res, next) => {
                Campsite.findByIdAndDelete(req.params.campsiteId)
                    .then(response => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(response)
                    })
                    .catch(err => next(err))
            })
    })

campsiteRouter.route('/:campsiteId/comments')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {


                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(campsite.comments)

                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`)
                    err.status = 404
                    return next(err)
                }
            })
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        //Mongoose will automatically validate if the req.body from the user is valid according to our Mongoose Schema
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    campsite.comments.push(req.body)

                    //save to modified object to MongoDB:
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'application/json')
                            res.json(campsite.comments)
                        })
                        .catch(err => next(err))
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`)
                    err.status = 404
                    return next(err)
                }
            })
            .catch(err => next(err))
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`)
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    for (let i = (campsite.comments.length - 1); i >= 0; i--) {
                        campsite.comments.id(campsite.comments[i]._id).remove()
                    }
                    //save to modified object (deleted comments) to MongoDB:
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'application/json')
                            res.json(campsite.comments)
                        })
                        .catch(err => next(err))
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`)
                    err.status = 404
                    return next(err)
                }
            })
    })

//Specific comment of a specific campsite:
campsiteRouter.route('/:campsiteId/comments/:commentId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {


                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(campsite.comments)

                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`)
                    err.status = 404
                    return next(err)
                }
                else {
                    err = new Error(`Comment ${req.params.campsiteId} not found`)
                    err.status = 404
                    return next(err)
                }
            })
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`)
    })
    .put(authenticate.verifyUser, (req, res) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    if (req.body.rating) {
                        campsite.comments.id(req.params.commentId).rating = req.body.rating
                    }
                    if (req.body.text) {
                        campsite.comments.id(req.params.commentId).text = req.body.text
                    }

                    //Save updated comment to the MongoDB:
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'application/json')
                            res.json(campsite)
                        })
                        .catch(err => next(err))

                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`)
                    err.status = 404
                    return next(err)
                }
                else {
                    err = new Error(`Comment ${req.params.campsiteId} not found`)
                    err.status = 404
                    return next(err)
                }
            })
            .catch(err => next(err))
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    campsite.comments.id(req.params.commentId).remove()

                    //Save updated comment to the MongoDB:
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'application/json')
                            res.json(campsite)
                        })
                        .catch(err => next(err))

                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`)
                    err.status = 404
                    return next(err)
                }
                else {
                    err = new Error(`Comment ${req.params.campsiteId} not found`)
                    err.status = 404
                    return next(err)
                }
            })

    })


module.exports = campsiteRouter