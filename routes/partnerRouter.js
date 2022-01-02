const express = require('express')
const partnerRouter = express.Router()
const Partner = require('../models/partner')
const authenticate = require('../authenticate')

partnerRouter.route('/')
    .get((req, res) => {
        Partner.find()
            .then(partnerPartners => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(partnerPartners)
            })
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        //Mongoose will automatically validate if the req.body from the user is valid according to our Mongoose Schema
        Partner.create(req.body)
            .then(partnerPartner => {
                console.log('Partner Created ', partnerPartner)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(partner)
            })
            .catch(err => next(err))
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /partners')
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Partner.deleteMany()
            .then(response => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(response)
            })
            .catch(err => next(err))
    })

partnerRouter.route('/:partnerId')
    .get((req, res, next) => {
        Partner.findById(req.params.partnerId)
            .then(partner => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(partner)
            })
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.status = 403
        res.end(`POST operation not supported on /partners/${req.params.partnerId}`)
    })
    .put(authenticate.verifyUser, (req, res) => {
        Partner.findByIdAndUpdate(req.params.partnerId, {
            $set: req.body
        }, { new: true })
            .then(partner => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(partner)
            })
            .catch(err => next(err))
            .delete((req, res, next) => {
                Partner.findByIdAndDelete(req.params.partnerId)
                    .then(response => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(response)
                    })
                    .catch(err => next(err))
            })
    })

module.exports = partnerRouter