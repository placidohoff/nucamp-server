const express = require('express');
const User = require('../models/user')
const passport = require('passport')
const authenticate = require('../authenticate')

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    err => {
      if (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.json({ err: err })
      } else {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json({ success: true, status: 'Registration Successful!' })
        })
      }
    }
  )
})

router.post('/login', passport.authenticate('local'), (req, res) => {
  //passport.authenticate() handles the logic for us!
  //Once user is authenticated, issue them a web-token:
  const token = authenticate.getToken({ _id: req.user._id })
  //^^We get the token from the exported authenticate module 'config.secretkey' and also attach the user's id to this new token object

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({ sucess: true, token: token, status: 'You are sucessfully logged in!' })
  //^^Added the token to the response object so the client will have it
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
