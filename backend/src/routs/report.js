const express = require("express");
const db = require("../database/connection")

let router = express.Router();



function getDeps(req, res, next) {
    const query = `SELECT DISTINCT SUP_BOX_NAME FROM a_job_trans`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details)
        }
    })
}

function getEmpByDeps(req, res, next) {
    const dep = req.params.dep
    const query = `SELECT employee.NATIONAL_ID_CARD_NO, employee.EMPLOYEE_ID, a_job_trans.MAIN_BOX_NAME, a_job_trans.SUP_BOX_NAME, employee.NAME_ARABIC FROM a_job_trans JOIN employee ON a_job_trans.NATIONAL_ID_CARD_NO = employee.NATIONAL_ID_CARD_NO WHERE a_job_trans.INDICATOR = 2 AND a_job_trans.SUP_BOX_NAME = "${dep}" ORDER BY a_job_trans.MAIN_BOX_NAME`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details)
        }
    })
}

function getjobgovern(req, res, next) {
    const query = `select DISTINCT employee.JOB_GOVERNORATE, governorate.GOVERNORATE_ARABIC FROM employee JOIN governorate ON employee.JOB_GOVERNORATE = governorate.GOVERNORATE`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details)
        }
    })
}

function getjobstation(req, res, next) {
    const govern = req.params.govern
    const query = `SELECT DISTINCT JOB_LOCATION, JOB_GOVERNORATE from employee where JOB_GOVERNORATE = ${govern} `
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {

            res.send(details)
        }
    })
}

function getEmpStationAndGovern(req, res, next) {
    let query;
    const govern = req.params.govern
    const station = req.params.station

    if (station === "null") {
        db.query(`SELECT employee.EMPLOYEE_ID, FOUND_ROWS() , employee.NAME_ARABIC, employee.JOB_LOCATION, governorate.GOVERNORATE_ARABIC FROM employee JOIN governorate ON employee.JOB_GOVERNORATE = governorate.GOVERNORATE WHERE governorate.GOVERNORATE = ${govern} ORDER BY employee.JOB_LOCATION`, (err, details) => {
            if (err) {
                next(err);
            } else {
                res.send(details)
            }
        })
    } else if (station !== "null") {
        db.query(`SELECT employee.EMPLOYEE_ID, FOUND_ROWS(), employee.NAME_ARABIC, employee.JOB_LOCATION, governorate.GOVERNORATE_ARABIC FROM employee JOIN governorate ON  employee.JOB_GOVERNORATE = governorate.GOVERNORATE WHERE governorate.GOVERNORATE = ${govern} AND JOB_LOCATION = "${station}" ORDER BY employee.JOB_LOCATION`, (err, details) => {
            if (err) {
                next(err);
            } else {

                details.length = details.length

                res.send(details)
            }
        })
    }


}


function getqn(req, res, next) {
    let query = `CALL autogetqn();`
    db.query(query, (err, details) => {
        if (err) {
            next(err)
        } else {
            details.shift()
            res.send(details)
        }
    })

}

function getEmps(req, res) {
    let query = `
    select COUNT(GENDER) AS MALE from employee WHERE GENDER = 1;
    select COUNT(GENDER) AS FEMALE from employee WHERE GENDER = 2;
    `
    db.query(query, (err, data) => {
        if (err) {
            res.json({ data: null, msg: "there is an error" })
        } else {
            res.json(data)
        }
    })
}

function getgid(req, res) {
    let query = `
      SELECT DISTINCT COUNT(NATIONAL_ID_CARD_NO) AS Technical FROM a_job_trans WHERE G_ID = 1;
      SELECT DISTINCT COUNT(NATIONAL_ID_CARD_NO) AS NON_Technical FROM a_job_trans WHERE G_ID = 2;
    `
    db.query(query, (err, data) => {
        if (err) {
            res.json({ data: null, msg: "there is an error" })
        } else {
            res.json(data)
        }
    })
}

function countEmpsInGoverns(req, res, next) {
    let query = `CALL countEmpsInGoverns();`

    db.query(query, (err, data) => {
        if (err) {
            next(err)
        } else {
            res.json(data)
        }
    })
}

function gethierarchicaldata(req, res, next) {

    jobdesc = req.query.jobdesc
    let query = `SELECT * FROM hierarchicaldata where level_1 = "${jobdesc}"`
    db.query(query, (err, data) => {
        if (err) {
            next(err)
        } else {
            for (let i = 0; i < 1436; i++) {
                var ob = data.filter(el => el.level_2 = "مدير ادارة الخدمات الاجتماعية")
            }
        }
    })
}

function getNatIdExpired(req, res, next) {
    let query = `SELECT NAME_ARABIC, EMPLOYEE_ID, NATIONAL_ID_CARD_EXPIRE_DATE FROM employee where NATIONAL_ID_CARD_EXPIRED = "true" ORDER BY NATIONAL_ID_CARD_EXPIRE_DATE`
    db.query(query, (err, data) => {
        if (err) {
            next(err)
        } else {
            res.send(data)
        }
    })
}

router
    .get('/getdeps', getDeps)
    .get('/getempbydeps/:dep', getEmpByDeps)
    .get('/getjobgovern', getjobgovern)
    .get('/getjobstation/:govern', getjobstation)
    .get('/getempstationandgovern/:govern/:station', getEmpStationAndGovern)
    .get('/getqn', getqn)
    .get('/getemps', getEmps)
    .get('/getgid', getgid)
    .get('/countempsingoverns', countEmpsInGoverns)
    .get('/gethierarchicaldata', gethierarchicaldata)
    .get('/getnatidexpired', getNatIdExpired)





module.exports = router;