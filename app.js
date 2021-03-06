//WE REMOVED COOKIE & SESSION-RELATED IMPORTS AND MIDDLEWARE AND USE JWT-RELATED IMPORTS INSTEAD
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const passport = require('passport')
const config = require('./config')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter')
const promotionRouter = require('./routes/promotionRouter')
const partnerRouter = require('./routes/partnerRouter')

//Connect to MongoDB Server:
const mongoose = require('mongoose')
const url = config.mongoUrl
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


app.use(passport.initialize())


//Return the home and users home to the client so they can be prompted by the auth middleware to log in
app.use('/', indexRouter);
app.use('/users', usersRouter);



app.use(express.static(path.join(__dirname, 'public')));

//WE NO LONGER USE 'AUTH' TO PROTECT ACCESS TO THE ENDPOINTS AT THE TOP LEVEL
//INSTEAD WE WILL PROTECT/CHECK ACCESS TO EACH ROUTE INDIVIDUALLY AND UNIQUELY 
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
