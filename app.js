var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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
app.use(cookieParser());

//AUTHENTICATION PROCESS:
//PLACED BEFORE RETURNING ANY STATIC INFO OR ANY INFO AT ALL IN THIS CASE
//WE ARE JUST DEFINING THE FUNCTION HERE. IT IS NOT CALLED JUST YET
function auth(req, res, next) {
  console.log(req.headers)
  const authHeader = req.headers.authorization
  if (!authHeader) {
    const err = new Error('You are not authenticated!')
    //response sent back to user letting the client's browser know that they must provide authentication by setting the authentication to 'Basic'
    res.setHeader('WWW-Authenticate', 'Basic')
    err.status = 401
    return next(err)
  }

  //if an autherization is provided:
  //Separate the password and user from the header via split methods on the string provided:
  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')
  const user = auth[0]
  const pass = auth[1]

  if (user === 'admin' && pass === 'password') {
    return next() //authorization success
  } else {
    const err = new Error('You are not authenticated')
    res.setHeader('WWW-Authenticate', 'Basic')
    err.status = 401
    return next(err)
  }

}

//Call our auth function before serving any data to the user:
app.use(auth)

app.use(express.static(path.join(__dirname, 'public')));

//separate route files:
app.use('/', indexRouter);
app.use('/users', usersRouter);
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
