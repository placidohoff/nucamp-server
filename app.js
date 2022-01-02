var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session')
const FileStore = require('session-file-store')(session)

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter')
const promotionRouter = require('./routes/promotionRouter')
const partnerRouter = require('./routes/partnerRouter')

//Connect to MongoDB Server:
const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/nucampsite'
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err)
)

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//We are providing a 'secret key' to our cookie's making them "signed-cookies" so we can validate if the cookie returned actually came from our server
//app.use(cookieParser('12345-67890-09876-54321'));
//^^We are no longer using cookies to strore login information but rather using the 'session' object

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}))

//Return the home and users home to the client so they can be prompted by the auth middleware to log in
app.use('/', indexRouter);
app.use('/users', usersRouter);

//AUTHENTICATION PROCESS:
//WE ARE JUST DEFINING THE FUNCTION HERE. IT IS NOT CALLED JUST YET
function auth(req, res, next) {
  console.log(req.headers)
  //If no session object exist, request/challenge the user to sign in
  if (!req.session.user) {
    const err = new Error('You are not authenticated!')
    err.status = 401
    return next(err)

  }
  //IF THE CLIENT HAS A SESSION
  else {
    if (req.session.user === 'authenticated') {
      return next()
    } else {
      const err = new Error('You are not authenticated')
      err.status = 401
      return next(err)
    }
  }

}

//Call our auth function before serving any data to the user:
app.use(auth)

app.use(express.static(path.join(__dirname, 'public')));


app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
