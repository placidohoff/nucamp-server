const express = require('express')
const promotionRouter = express.Router()
const Promotion = require('../models/promotion')
const authenticate = require('../authenticate')


promotionRouter.route('/')
    .get((req, res) => {
        Promotion.find()
            .then(promotions => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(promotions)
            })
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        //Mongoose will automatically validate if the req.body from the user is valid according to our Mongoose Schema
        Promotion.create(req.body)
            .then(promotion => {
                console.log('Campsite Created ', promotion)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(promotion)
            })
            .catch(err => next(err))
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /promotions')
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Promotion.deleteMany()
            .then(response => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(response)
            })
            .catch(err => next(err))
    })

promotionRouter.route('/:promotionId')
    .get((req, res, next) => {
        Promotion.findById(req.params.promotionId)
            .then(promotion => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(promotion)
            })
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.status = 403
        res.end(`POST operation not supported on /promotions/${req.params.promotionId}`)
    })
    .put(authenticate.verifyUser, (req, res) => {
        Promotion.findByIdAndUpdate(req.params.promotionId, {
            $set: req.body
        }, { new: true })
            .then(promotion => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(promotion)
            })
            .catch(err => next(err))
            .delete((req, res, next) => {
                Promotion.findByIdAndDelete(req.params.promotionId)
                    .then(response => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(response)
                    })
                    .catch(err => next(err))
            })
    })



module.exports = promotionRouter