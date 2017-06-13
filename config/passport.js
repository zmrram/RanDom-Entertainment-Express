var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        function(username, password, done) {
            User.findOne({ username: username }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Username does not exist' });
                }

                bcrypt.compare(password, user.password, function(err, isMatch) {
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password is wrong' });
                    }
                });
            });
        }
    ));
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}