var express = require('express');
var router = express.Router();
var accessControle = require('../config/accesscontrol');

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

router.post('/setting', function(req, res) {
    User.findOne({ username: req.user.username }, function(err, result) {
        if (req.query.Action === 'changeEmail') {
            if (req.body.old_password === '') {

            }
        }
        if (req.query.Action === 'changePassword') {

        }
    });
});

router.get('/logout', ensureAuthenticated, user_controller.user_logout);

module.exports = router;