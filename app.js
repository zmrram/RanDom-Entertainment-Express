const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

//init mongoDB 
var mongodb = require('./config/database');
mongoose.connect(mongodb.database);
mongoose.connection.once('open', function(e) {
    console.log('Connected to MongoDB...');
}).on('error', function(err) {
    console.log(err);
});
//init express app
var app = express();

//set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json 
app.use(bodyParser.json());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//set express-session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true }
}))

//set express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//set flash middleware
app.use(flash());

//set global variables 
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//get route files
var index = require('./routes/index');
var users = require('./routes/users');

//set up route middleware
app.use('/', index);
app.use('/users', users);

//start server
app.listen(3000, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Server started on port 3000...");
    }
});