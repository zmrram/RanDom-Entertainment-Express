var User = require('../models/user');
var bcrypt = require('bcryptjs');
var passport = require('passport');

module.exports.create_user = function(req, res) {
    //Form validation using express validator middleware
    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Password do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        res.render('register', { errors: errors });
    } else {
        var query = {
            username: req.body.username
        };
        //search the database for the username to see if it already exist
        User.findOne(query, function(err, otherUser) {
            if (err) {
                console.log(err);
            } else {
                //if the username already exist, flash error message and re-render register page
                if (otherUser) {
                    req.flash('error_msg', 'Username already exist!');
                    res.redirect('register');
                } else {
                    //if not create a new user
                    var newUser = new User({
                        username: req.body.username,
                        password: req.body.password,
                        email: req.body.email,
                        name: req.body.name
                    });

                    // user bcryptjs to hash the password ( async operation)
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(req.body.password, salt, function(err, hash) {
                            newUser.password = hash;
                            //save the new user to MongoDB running in localhost
                            newUser.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    req.flash('success_msg', 'Account created!');
                                    res.redirect('login');
                                }
                            });
                        });
                    });
                }
            }
        });
    }
}

module.exports.user_login = function(req, res, next) {
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.render('login', { errors: errors });
    } else {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next);
    }
}

module.exports.user_logout = function(req, res) {
    req.logout();
    req.flash('success_msg', 'Successfully logged out!');
    res.redirect('login');
}