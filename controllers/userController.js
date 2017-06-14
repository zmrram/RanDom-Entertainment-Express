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

module.exports.user_setting = function(req, res) {
    if (req.query.Action === 'changeEmail') {
        changeEmail(req, res);
    }
    if (req.query.Action === 'changePassword') {
        changePassword(req, res);
    }
}

function changeEmail(req, res) {
    req.checkBody('old_email', 'Current email required').notEmpty();
    req.checkBody('email', 'Not a valid email address').isEmail();
    var errors = req.validationErrors();
    if (errors) {
        res.render('setting', { errors: errors });
    } else {
        if (req.body.old_email === req.user.email) {
            User.update({ username: req.user.username }, { email: req.body.email }, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success_msg', 'Email updated successfully!');
                    res.redirect('/users/setting');
                }
            });
        } else {
            req.flash('error_msg', 'Current email is incorrect!!!');
            res.redirect('/users/setting');
        }
    }
}

function changePassword(req, res) {
    req.checkBody('old_password', 'Current password required').notEmpty();
    req.checkBody('password', 'Mismatch password').equals(req.body.password2);
    var errors = req.validationErrors();
    if (errors) {
        res.render('setting', { errors: errors });
    } else {
        bcrypt.compare(req.body.old_password, req.user.password, function(err, isMatch) {
            if (isMatch) {
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(req.body.password, salt, function(err, hash) {
                        User.update({ username: req.user.username }, { password: hash }, function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success_msg', 'Password changed successfully!');
                                res.redirect('/users/setting');
                            }
                        });
                    });
                });
            } else {
                req.flash('error_msg', 'Current password is incorrect!!!');
                res.redirect('/users/setting');
            }
        });
    }
}