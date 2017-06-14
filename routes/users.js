var express = require('express');
var router = express.Router();
var ensureAuthenticated = require('../config/accessControl');
var user_controller = require('../controllers/userController');
router.get('/register', function(req, res) {
    res.render('register');
});

router.post('/register', user_controller.create_user);

router.get('/login', function(req, res) {
    res.render('login');
});

router.post('/login', user_controller.user_login);

router.get('/setting', ensureAuthenticated, function(req, res) {
    res.render('setting')
});

router.post('/setting', user_controller.user_setting);

router.get('/logout', ensureAuthenticated, user_controller.user_logout);

module.exports = router;