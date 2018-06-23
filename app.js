// createError
const createError = require('http-errors');

// express
const express = require('express');

// cookieParser
const cookieParser = require('cookie-parser');

// logger
const logger = require('morgan');

// path
const path = require('path');

// argv
const argv = require('minimist')(process.argv.slice(2));

// helmet
const helmet = require('helmet');

// Start express app
const app = express();

// Bind socket.io to app.io
app.io = require('socket.io')();

// Fetch the indexRouter
const indexRouter = require('./src/controllers/index')(app);

// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'hbs');

// All stock express middleware
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Bind the indexRouter
app.use('/', indexRouter);

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

// If we're in a travis test, we'll start the webserver and kill it in 5 seconds so travis knows all is fine
if ('travistest' in argv) {
    console.log('Travis test detected, killing process in 5 seconds');
    setTimeout(function () {
        process.exit(0);
    }, 5000);
}
module.exports = app;
