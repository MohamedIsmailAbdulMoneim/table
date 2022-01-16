const express = require("express");
const db = require("../database/connection")
const utils = require('../lib/utils');
const passport = require('passport');



let router = express.Router();

function handleLogin(req, res, next) {

    let { uname, pw } = req.body

    db.query(`SELECT * FROM users WHERE username = "${uname}"`, function (err, rows) {
        if (err) {
            next(err);
        }
        if (!rows.length) {
            return res.status(401).json({ success: false, msg: "اسم المستخدم غير صحيح" })
        }

        const isValid = utils.validPassword(pw, rows[0].hash, rows[0].salt);

        if (isValid) {
            const tokenObject = utils.issueJWT(rows[0]);
            res.json({ success: true, msg: "you have loged in successfuly", data: { id: rows[0].id, token: tokenObject } })
        } else {
            res.status(401).json({ success: false, msg: "كلمة المرور غير صحيحة" });
        }
    });

}

function handleRegister(req, res, next) {

    let { uname, pw, userType } = req.body
    db.query(`SELECT * FROM users WHERE username = "${uname}"`, function (err, rows) {
        if ((!uname || uname == 'undefined') || (!pw || pw == 'undefined')) {
            res.status(400).json({ success: false, msg: "username and password feilds are empty", data: rows });

        } else if (err) {
            next(err);
            res.status(400).json({ success: false, msg: "ther's an error" });
        } else if (rows.length) {
            res.status(400).json({ success: false, msg: "user already exists" });
        } else {
            // if there is no user with that username
            // create the user

            const saltHash = utils.genPassword(pw);

            const salt = saltHash.salt;
            const hash = saltHash.hash;

            var newUserMysql = {
                username: uname,
                salt: salt,
                hash: hash,
                userType
            };

            var insertQuery = "INSERT INTO users ( username, salt, hash, user_type ) values (?,?,?,?)";
            db.query(insertQuery, [newUserMysql.username, newUserMysql.salt, newUserMysql.hash, newUserMysql.userType], function (err, rows) {
                // newUserMysql.id = rows.insertId;
                const tokenObject = utils.issueJWT(newUserMysql);
                res.status(200).json({ success: true, msg: "new user successfuly added", data: { id: newUserMysql.id, token: tokenObject } })
            });
        }
    });
}


router


    .post('/register', handleRegister)

    .post('/login', handleLogin)

    .get('/protected', passport.authenticate('jwt', { session: false }), (req, res, next) => {
        res.status(200).json({ success: true, msg: "You are successfully authenticated to this route!", userType: req.user[0].user_type });
    })







module.exports = router;