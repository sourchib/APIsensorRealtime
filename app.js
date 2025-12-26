var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const sequelize = require('./config/database');
const mqttService = require('./services/mqttService');
const apiRouter = require('./routes/api');
// var indexRouter = require('./routes/index'); // API doesn't need these placeholders
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup removed for API
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

// Database Synchronization
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Failed to sync database:', err);
});

// MQTT Connection
mqttService.connect();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Serve Sensor Monitor View
app.get('/monitor', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'monitor.html'));
});

// Mount API routes
app.use('/', apiRouter);

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

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
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
