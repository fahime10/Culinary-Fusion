/**
 * app component
 * 
 * This component starts all the processes in the server.
 * 
 * This component accesses the .env file to retrieve the database connection link and sends a query
 * to make sure MongoDB is running.
 * 
 */

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/indexRouter');
const routesManager = require('./routes/routesManager');

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

require('dotenv').config();

const mongoDB = process.env.MONGODB;

// Database connection
async function main() {
  await mongoose.connect(mongoDB);

  console.log('Connected to MongoDB');
}

// Catch any errors when connecting to the database
main().catch((err) => console.log(err));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', routesManager);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
  console.log("Something went wrong! 404");
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

module.exports = app;
