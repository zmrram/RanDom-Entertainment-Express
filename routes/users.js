var express = require('express');
var router = express.Router();

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
    }
});

router.get('/login', function(req, res) {
    res.render('login');
});
module.exports = router;