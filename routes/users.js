const express = require('express');
const User = require('../models/user')

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then(user => {
      if (user) {
        const err = new Error(`User ${req.body.username} already exists!`)
        err.status = 403
        return next(err)
      } else {
        User.create({
          username: req.body.username,
          password: req.body.password
        })
          .then(user => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json({ status: 'Registration Sucessful!', user: user })
          })
          .catch(err => next(err))
      }
    })
    .catch(err => next(err))
})

router.post('/login', (req, res, next) => {
  //no session-cookies? 
  if (!req.session.user) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const err = new Error('You are not authenticated!')
      //Set user's header to Basic so that they may be challenged to log in:
      res.setHeader('WWW-Authenticate', 'Basic')
      err.status = 401
      //send the error to mongoose's error handler:
      return next(err)
    }
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')
    const username = auth[0]
    const password = auth[1]

    User.findOne({ username: username })
      .then(user => {
        //Mongoose cannot find user:
        if (!user) {
          const err = new Error(`User ${username} does not exist!`)
          err.status = 401
          return next(err)
        }
        //Mongoose has found user:
        else {
          if (user.password !== password) {
            const err = new Error(`Password is incorrect!`)
            err.status = 401
            return next(err)
          }
          else {
            req.session.user = 'authenticated'
            req.statusCode = 200
            res.setHeader('Content-Type', 'text/plain')
            res.end('You are authenticated!')
          }
        }
      })
      .catch(err => next(err))
  }
  //session cookie already established:
  else {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('You are already authenticated!')
  }
})

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy()
    res.clearCookie('session-id')
    res.redirect('/')
  } else {
    const err = new Error('You are not logged in!')
    err.status = 401
    return next(err)
  }

})


module.exports = router;
