var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');

var User = require('../models/user');

router.get('/register', function(req, res) {
    res.render('register');
});

router.post('/register', function(req, res) {
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
        User.findOne(query, function(err, otherUser) {
            if (err) {
                console.log(err);
            } else {
                if (otherUser) {
                    req.flash({ 'error_msg': 'Username already exist!' });
                    res.render('register');
                } else {
                    var newUser = new User({
                        username: req.body.username,
                        password: req.body.password,
                        email: req.body.email,
                        name: req.body.name
                    });
                    var bcrypt = require('bcryptjs');
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(req.body.password, salt, function(err, hash) {
                            newUser.password = hash;
                            newUser.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    req.flash({ 'success_msg': 'Account created!' });
                                    res.render('login');
                                }
                            });
                        });
                    });

                }
            }
        });
    }
});

router.get('/login', function(req, res) {
    res.render('login');
});
module.exports = router;