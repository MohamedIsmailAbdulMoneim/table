const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('./connection')

// At a minimum, you must pass the `jwtFromRequest` and `secretOrKey` properties
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "nevergiveup"
};

// app.js will pass the global passport object here, and this function will configure it
module.exports = (passport) => {
    // The JWT payload is passed into the verify callback
    passport.use(new JwtStrategy(options, function (jwt_payload, done) {

        db.query(`SELECT * FROM users WHERE id = ${jwt_payload.sub}`, function (err, rows) {
            if (err)
                return done(err);
            if (!rows.length) {
                return done(null, false); // req.flash is the way to set flashdata using connect-flash
            }
            if (rows) {
                return done(null, rows);
            }

        });

    }));
}