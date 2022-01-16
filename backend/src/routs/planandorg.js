const express = require("express");
const db = require("../database/connection")
const jp = require('jsonpath');

let router = express.Router();


/* --------------------Experience-------------------- */
function newEmpExp(req, res, next) {
    let data = req.body.insertedData
    let getData = req.body.getData
    let query = `INSERT INTO employee_experince
    (PLACE_NAME, JOB_NAME, START_DATE, END_DATE, calculated_start_date,
    calculated_end_date ,EXP_TYP_CODE, is_shown ,NATIONAL_ID_CARD_NO) VALUES ${data};
    SELECT * FROM employee_experince
    JOIN exp_type ON employee_experince.EXP_TYP_CODE = exp_type.EXP_TYP_CODE WHERE ${getData}
    
    `
    db.query(query, function (err, data) {
        if (err) {
            next(err);
            if (err.sqlMessage.indexOf("Duplicate entry") !== -1) {
                res.json({ data: [[], []], msg: "تم إدخال هذه الخبرة من قبل" })
            }
        } else {

            res.json({ data: data, msg: "تم إدخال البيانات بنجاح" });
        }

    })
}

function getEmpExprerience(req, res, next) {
    const data = req.query.data || 0
    let query = `SELECT *, (SELECT NAME_ARABIC FROM employee WHERE employee.NATIONAL_ID_CARD_NO = employee_experince.NATIONAL_ID_CARD_NO) AS NAME_ARABIC FROM employee_experince
    JOIN exp_type ON employee_experince.EXP_TYP_CODE = exp_type.EXP_TYP_CODE WHERE ${data}`

    console.log(query);
    db.query(query, (err, details) => {
        if (err) {
            next(err)
        } else {
            res.send(details);
        }

    })
}

function editEmpExp(req, res, next) {
    let data = req.body.data
    let id = data[data.length - 1]
    data.pop()
    let query = `UPDATE employee_experince SET ${data} WHERE id = ${id};
    SELECT *, (SELECT NAME_ARABIC FROM employee WHERE employee.NATIONAL_ID_CARD_NO = employee_experince.NATIONAL_ID_CARD_NO) AS NAME_ARABIC FROM employee_experince
    JOIN exp_type ON employee_experince.EXP_TYP_CODE = exp_type.EXP_TYP_CODE WHERE employee_experince.NATIONAL_ID_CARD_NO = ${req.body.nat}
    `
    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: [] })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

function deleteExperience(req, res, next) {
    let data = req.body
    let id = data[0]
    let expType = data[1]
    let nat = data[2]

    let query = `
    UPDATE employee_experince SET is_shown = "false${id}" where id = ${id};
    SELECT * FROM employee_experince WHERE EXP_TYP_CODE = ${expType} AND NATIONAL_ID_CARD_NO = ${nat} AND is_shown = "true";
    `

    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: [] })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

/* -----------------End--Of-Experience-------------------- */


/*  ------------------------------Appraisal----------------------- */

function newAppraisal(req, res, next) {
    const { appDate, appValue, empid, empname, isShown } = req.body.insertedData

    if (empid == "null" && empname == "null") {
        res.json({ data: null, msg: "يجب إدخال أي من الإسم ورقم الأداء" })
        return;
    }
    let query = `INSERT INTO employee_appraisal (APPRAISAL_DATE, APPRAISAL , NATIONAL_ID_CARD_NO , is_shown , ORGANIZATION)
    VALUES (${appDate},(select APPRAISAL FROM appraisal WHERE APPRAISAL_ARABIC = "${appValue}")
    ,(select NATIONAL_ID_CARD_NO FROM employee WHERE ${empid != "null" ? `EMPLOYEE_ID = ${empid} `
            : empname || empname !== "undefined" ? `NAME_ARABIC = "${empname}"` : null}), ${isShown} ,30);
    SELECT employee.NAME_ARABIC, employee_appraisal.APPRAISAL_DATE, appraisal.APPRAISAL_ARABIC,employee_appraisal.id,
    employee.EMPLOYEE_ID, employee_appraisal.NATIONAL_ID_CARD_NO
    FROM
    employee_appraisal
    JOIN employee ON employee.NATIONAL_ID_CARD_NO = employee_appraisal.NATIONAL_ID_CARD_NO
    JOIN APPRAISAL ON APPRAISAL.APPRAISAL = employee_appraisal.APPRAISAL
    WHERE ${req.body.getData};
     `
    db.query(query, (err, details) => {
        if (err) {
            if (err.sqlMessage.indexOf("Duplicate entry") !== -1) {
                res.json({ data: [[], []], msg: "تم إدخال التقييم من قبل" })
            }
        } else {
            res.json({ data: details, msg: "تم إدخال التقييم بنجاح" });
        }
    })
}

function getEmpApprails(req, res, next) {
    const data = req.query.data || 0
    let query = `SELECT employee.NAME_ARABIC, employee_appraisal.APPRAISAL_DATE, appraisal.APPRAISAL_ARABIC,employee_appraisal.id,
    employee.EMPLOYEE_ID, employee_appraisal.NATIONAL_ID_CARD_NO
    FROM
    employee_appraisal
    JOIN employee ON employee.NATIONAL_ID_CARD_NO = employee_appraisal.NATIONAL_ID_CARD_NO
    JOIN APPRAISAL ON APPRAISAL.APPRAISAL = employee_appraisal.APPRAISAL
    WHERE ${data}`
    
    db.query(query, (err, details) => {
        if (err) {
            next(err)
        } else {
            res.send(details);
        }
    })
}

function updateAppraisal(req, res, next) {
    let { appraisal, year, empNat, rowAppraisal } = req.body.insertedData
    // let query = `UPDATE employee_appraisal JOIN employee ON employee_appraisal.NATIONAL_ID_CARD_NO = employee.NATIONAL_ID_CARD_NO JOIN appraisal SET employee_appraisal.APPRAISAL = appraisal.APPRAISAL WHERE appraisal.APPRAISAL_ARABIC = "${req.body.appraisal}" AND employee_appraisal.APPRAISAL_DATE = ${req.body.year} AND employee_appraisal.NATIONAL_ID_CARD_NO = ${req.body.empNat}`
    let query = `UPDATE employee_appraisal
    SET APPRAISAL = (SELECT APPRAISAL FROM appraisal WHERE APPRAISAL_ARABIC = "${appraisal}")
    , APPRAISAL_DATE = ${year} WHERE id = ${rowAppraisal};
    SELECT employee.NAME_ARABIC, employee_appraisal.APPRAISAL_DATE, appraisal.APPRAISAL_ARABIC,employee_appraisal.id,
    employee.EMPLOYEE_ID, employee_appraisal.NATIONAL_ID_CARD_NO
    FROM
    employee_appraisal
    JOIN employee ON employee.NATIONAL_ID_CARD_NO = employee_appraisal.NATIONAL_ID_CARD_NO
    JOIN APPRAISAL ON APPRAISAL.APPRAISAL = employee_appraisal.APPRAISAL
    WHERE ${req.body.getData};
    `
    db.query(query, (err, details) => {
        if (err) {
            next(err)
            res.json({ data: [], status: 400 })
        } else {
            res.json({ data: details, status: 200 });
        }
    })
}

function deleteAppraisal(req, res, next) {
    let data = req.body.insertedData
    let id = data[0]
    let query = `UPDATE employee_appraisal SET is_shown = "false${id}" where id = ${id};
    SELECT employee.NAME_ARABIC, employee_appraisal.APPRAISAL_DATE, appraisal.APPRAISAL_ARABIC,employee_appraisal.id,
    employee.EMPLOYEE_ID, employee_appraisal.NATIONAL_ID_CARD_NO
    FROM
    employee_appraisal
    JOIN employee ON employee.NATIONAL_ID_CARD_NO = employee_appraisal.NATIONAL_ID_CARD_NO
    JOIN APPRAISAL ON APPRAISAL.APPRAISAL = employee_appraisal.APPRAISAL
    WHERE ${req.body.getData}
    `
    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: [] })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}



/*  ------------------------End---Of--Appraisal----------------------- */


/*  ------------------------------Transactions----------------------- */

function postnewtrans(req, res, next) {
    let query;
    let data = req.body.data
    let nameOrId = data[0][1].substring(1)
    let curIndicator = data[0][0].substring(0) == "أصلية" ? 1 : data[0][0].substring(0) == "حالية" ? 2 : data[0][0].substring(0) == "سابقة" ? 3 : null
    let nextIndicator = 3

    data[0].splice(0, 1)

    query =
        ` update a_job_trans set INDICATOR = ${nextIndicator} WHERE INDICATOR = ${curIndicator}
        AND NATIONAL_ID_CARD_NO = ${nameOrId};
    INSERT INTO a_job_trans(
        NATIONAL_ID_CARD_NO,
        is_shown,
        TRANS_DATE,
        CAT_ID,
        ORGANIZATION,
        MAIN_BOX_ID,
        SUP_BOX_ID,
        G_ID,
        SUP_BOX_NAME,
        JOB_ASSIGNMENT_FORM,
        INDICATOR,
        JOB_LOCATION,
        JOB_AREA,
        JOB_GOVERNORATE,
        MAIN_BOX_NAME
    ) VALUES ${data};
    select *, a_job_trans.SUP_BOX_NAME AS catename from a_job_trans JOIN employee JOIN job_assignment_form JOIN indicators
    JOIN a_sup_box JOIN a_category JOIN a_job_groups ON a_job_trans.G_ID = a_job_groups.G_ID AND a_category.CAT_ID =
    a_job_trans.CAT_ID AND a_sup_box.SUP_BOX_ID = a_job_trans.SUP_BOX_ID AND
    a_job_trans.NATIONAL_ID_CARD_NO = employee.NATIONAL_ID_CARD_NO AND a_job_trans.JOB_ASSIGNMENT_FORM =
    JOB_ASSIGNMENT_FORM.JOB_ASSIGNMENT_FORM AND a_job_trans.INDICATOR = indicators.INDICATOR WHERE employee.NATIONAL_ID_CARD_NO
    IN ${data[0][0].substring(1)} ORDER by a_job_trans.TRANS_DATE;
    `
    db.query(query, (err, details) => {
        if (err) {
            if (err.sqlMessage.indexOf("Duplicate entry") !== -1) {
                res.json({ data: [[], []], msg: "تم إدخال هذا التدرج من قبل" })
            }
        } else {
            res.json({ data: details, msg: "تم إدخال البيانات بنجاح" });
        }
    })
}

function postBulkTrans(req, res, next) {
    let data = req.body
    let query = `INSERT INTO a_job_trans (NATIONAL_ID_CARD_NO, TRANS_DATE, CAT_ID,ORGANIZATION,MAIN_BOX_ID,SUP_BOX_ID,
    G_ID,SUP_BOX_NAME,JOB_ASSIGNMENT_FORM,INDICATOR,MAIN_BOX_NAME) VALUES ${data}`
    db.query(query, function (err, data) {
        if (err) {
            next(err);
            res.json({ data: [], msg: "يوجد خطاء بقاعدة البيانات" });
        } else {
            res.json({ data: data, msg: "تم إدخال البيانات بنجاح" });
        }
    })
}

function getEmpTrans(req, res, next) {
    const nameOrId = req.query.nameOrId

    let query = `select *, (SELECT JOB_ASSIGNMENT_FORM_ARABIC FROM job_assignment_form WHERE job_assignment_form.JOB_ASSIGNMENT_FORM = a_job_trans.JOB_ASSIGNMENT_FORM) as jobassignmentar ,(SELECT station_name FROM stations WHERE a_job_trans.JOB_LOCATION = id) AS station, (SELECT NAME_ARABIC FROM employee WHERE employee.NATIONAL_ID_CARD_NO = a_job_trans.NATIONAL_ID_CARD_NO) as NAME_ARABIC ,(SELECT area_name FROM areas WHERE a_job_trans.JOB_AREA = id) AS AREA, (SELECT GOVERNORATE_ARABIC FROM governorate WHERE a_job_trans.JOB_GOVERNORATE = GOVERNORATE) AS GOV ,a_job_trans.SUP_BOX_NAME AS catename from a_job_trans
     JOIN indicators JOIN a_sup_box JOIN a_category
    JOIN a_job_groups ON a_job_trans.G_ID = a_job_groups.G_ID AND a_category.CAT_ID = a_job_trans.CAT_ID
    AND a_sup_box.SUP_BOX_ID = a_job_trans.SUP_BOX_ID AND
     a_job_trans.INDICATOR = indicators.INDICATOR
    WHERE NATIONAL_ID_CARD_NO = ${nameOrId} AND a_job_trans.is_shown = "true" ORDER by a_job_trans.TRANS_DATE`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            
            res.send(details);
        }
    })
}

function updateEmpTrans(req, res, next) {
    let { empname, empid, id, station } = req.body

    let nameOrId;
    if (empname.length > 0) {
        nameOrId = `NATIONAL_ID_CARD_NO = (SELECT NATIONAL_ID_CARD_NO FROM employee where name_arabic = "${empname}")`
    } else if (empid.length > 0) {
        nameOrId = `NATIONAL_ID_CARD_NO = (SELECT NATIONAL_ID_CARD_NO FROM employee where employee_id = ${empid})`

    }
    let query = `
        UPDATE a_job_trans SET SUP_BOX_NAME = "${req.body.catname}", MAIN_BOX_NAME = "${req.body.jdname}",
        JOB_LOCATION = (SELECT id FROM stations WHERE station_name = "${station}" ), JOB_AREA = (SELECT area_id FROM stations WHERE station_name = "${station}"),
        JOB_GOVERNORATE = (SELECT GOVERNORATE_ID FROM stations WHERE station_name = "${station}"),
        SUP_BOX_ID = (SELECT SUP_BOX_ID FROM a_sup_box WHERE SUP_BOX_NAME = "${req.body.supboxname}" AND
        MAIN_BOX_ID = ${req.body.mainboxid}), G_ID = (SELECT G_ID FROM a_job_groups WHERE G_NAME = "${req.body.gname}"),
        job_assignment_form = (SELECT JOB_ASSIGNMENT_FORM FROM job_assignment_form WHERE
        JOB_ASSIGNMENT_FORM_ARABIC = "${req.body.jasi}"), INDICATOR = (SELECT INDICATOR FROM indicators WHERE
        INDICATOR_NAME = "${req.body.indname}" ) WHERE NATIONAL_ID_CARD_NO = (SELECT NATIONAL_ID_CARD_NO FROM
        employee WHERE NAME_ARABIC = "${req.body.empname}"
        ) AND ROW_ID = ${id}
        ;select *, (SELECT JOB_ASSIGNMENT_FORM_ARABIC FROM job_assignment_form WHERE job_assignment_form.JOB_ASSIGNMENT_FORM = a_job_trans.JOB_ASSIGNMENT_FORM) as jobassignmentar ,(SELECT station_name FROM stations WHERE a_job_trans.JOB_LOCATION = id) AS station, (SELECT NAME_ARABIC FROM employee WHERE employee.NATIONAL_ID_CARD_NO = a_job_trans.NATIONAL_ID_CARD_NO) as NAME_ARABIC ,(SELECT area_name FROM areas WHERE a_job_trans.JOB_AREA = id) AS AREA, (SELECT GOVERNORATE_ARABIC FROM governorate WHERE a_job_trans.JOB_GOVERNORATE = GOVERNORATE) AS GOV ,a_job_trans.SUP_BOX_NAME AS catename from a_job_trans
        JOIN indicators JOIN a_sup_box JOIN a_category
       JOIN a_job_groups ON a_job_trans.G_ID = a_job_groups.G_ID AND a_category.CAT_ID = a_job_trans.CAT_ID
       AND a_sup_box.SUP_BOX_ID = a_job_trans.SUP_BOX_ID AND
        a_job_trans.INDICATOR = indicators.INDICATOR
       WHERE ${nameOrId} AND a_job_trans.is_shown = "true" ORDER by a_job_trans.TRANS_DATE`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            console.log(details);
            res.json(details);
        }
    })
}

function deleteTrans(req, res, next) {
    let data = req.body
    let query = `UPDATE a_job_trans SET ${data}`

    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: [] })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })

}


/*  -----------------------end---of----Transactions----------------------- */

/* ----------------------------education---------------------------------- */

function postNewEmpEdu(req, res, next) {
    let data = req.body
    let emp = data[0].substring(1)
    let query =
        `
        INSERT INTO outsource_employee_education_degree (NATIONAL_ID_CARD_NO, is_shown ,DEGREE,
        SPECIALITY, SPECIALITY_DETAIL, GRADUATION_GRADE, UNIVERSITY_SCHOOL, GRADUATION_YEAR, ORGANIZATION) VALUES ${data};
        SELECT * FROM outsource_employee_education_degree JOIN education_degree JOIN dgree_speciality JOIN dgree_speciality_detail
        JOIN UNIVERSITY_SCHOOL JOIN GRADUATION_GRADE ON outsource_employee_education_degree.DEGREE = education_degree.DEGREE
        AND outsource_employee_education_degree.SPECIALITY =
        dgree_speciality.SPECIALITY AND outsource_employee_education_degree.SPECIALITY_DETAIL
        = dgree_speciality_detail.SPECIALITY_DETAIL
        AND outsource_employee_education_degree.UNIVERSITY_SCHOOL = university_school.UNIVERSITY_SCHOOL AND
        outsource_employee_education_degree.GRADUATION_GRADE
        = graduation_grade.GRADUATION_GRADE AND outsource_employee_education_degree.NATIONAL_ID_CARD_NO IN ${emp}
    `
    db.query(query, (err, data) => {
        if (err) {
            if (err.sqlMessage.indexOf("Duplicate entry") !== -1) {
                res.json({ data: [[], []], msg: "تم إدخال هذا المؤهل من قبل" })
            }
        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

function getEmpEdu(req, res, next) {
    let empid = req.query.empid
    let empname = req.query.empname
    let query = `SELECT *,(SELECT DEGREE_ARABIC FROM education_degree WHERE education_degree.DEGREE = employee_education_degree.DEGREE OR null) as DEGREE_ARABIC,(SELECT SPECIALITY_ARABIC FROM dgree_speciality WHERE dgree_speciality.SPECIALITY = employee_education_degree.SPECIALITY OR null) as SPECIALITY_ARABIC,(SELECT SPECIALITY_DETAIL_ARABIC from dgree_speciality_detail where dgree_speciality_detail.SPECIALITY_DETAIL = employee_education_degree.SPECIALITY_DETAIL or null) as SPECIALITY_DETAIL_ARABIC,(SELECT UNIVERSITY_SCHOOL_ARABIC FROM university_school WHERE university_school.UNIVERSITY_SCHOOL = employee_education_degree.UNIVERSITY_SCHOOL or null) as UNIVERSITY_SCHOOL_ARABIC,(SELECT GRADE_ARABIC FROM graduation_grade where graduation_grade.GRADUATION_GRADE = employee_education_degree.GRADUATION_GRADE or null) as GRADE_ARABIC,(SELECT name_arabic FROM employee WHERE employee.NATIONAL_ID_CARD_NO = employee_education_degree.NATIONAL_ID_CARD_NO) as NAME_ARABIC FROM employee_education_degree
    WHERE ${empid.length !== 0 ? `NATIONAL_ID_CARD_NO = (SELECT NATIONAL_ID_CARD_NO FROM employee where employee_id = ${empid}) ` :
            empname || empname !== "undefined" ? `NATIONAL_ID_CARD_NO = (SELECT NATIONAL_ID_CARD_NO FROM employee where name_arabic = "${empname}")` : null} AND
    employee_education_degree.is_shown = "true"`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function getOutsourceEmpEdu(req, res, next) {
    let empid = req.query.empid
    let empname = req.query.empname

    let query = `SELECT * FROM outsource_employee_education_degree JOIN education_degree JOIN
    dgree_speciality JOIN dgree_speciality_detail JOIN UNIVERSITY_SCHOOL JOIN GRADUATION_GRADE JOIN
    (SELECT outsource_employee.EMPLOYEE_ID, outsource_employee.NAME_ARABIC ,outsource_employee.NATIONAL_ID_CARD_NO
    FROM outsource_employee ) AS detofemp ON outsource_employee_education_degree.DEGREE = education_degree.DEGREE AND
    outsource_employee_education_degree.SPECIALITY = dgree_speciality.SPECIALITY AND
    outsource_employee_education_degree.SPECIALITY_DETAIL = dgree_speciality_detail.SPECIALITY_DETAIL AND
    outsource_employee_education_degree.UNIVERSITY_SCHOOL = university_school.UNIVERSITY_SCHOOL AND 
    outsource_employee_education_degree.GRADUATION_GRADE = graduation_grade.GRADUATION_GRADE AND 
    outsource_employee_education_degree.NATIONAL_ID_CARD_NO = detofemp.NATIONAL_ID_CARD_NO WHERE 
    ${empid.length !== 0 ? `detofemp.EMPLOYEE_ID = ${empid} ` : empname || empname !== "undefined" ?
            `detofemp.NAME_ARABIC = "${empname}"` : null} AND outsource_employee_education_degree.is_shown = "true"`

    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function editEmpEdu(req, res, next) {
    let data = req.body
    let id = data[data.length - 1]
    data.pop()
    let query = `UPDATE employee_education_degree SET ${data} WHERE id = ${id}`
    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: null })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

function editOutsourceEmpEdu(req, res, next) {
    let data = req.body
    let id = data[data.length - 1]
    data.pop()
    let query = `UPDATE outsource_employee_education_degree SET ${data} WHERE id = ${id}`
    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: null })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

function deleteEdu(req, res, next) {
    let id = req.query.id
    let query = `
    UPDATE employee_education_degree SET is_shown = "false${id}" where id = ${id};
    `

    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: null })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

function deleteOutsourceEdu(req, res, next) {
    let id = req.query.id
    let query = `
    UPDATE outsource_employee_education_degree SET is_shown = "false${id}" where id = ${id};
    `
    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: null })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

/* --------------end-----of---------education---------------------------------- */

/* ----------------------------family---------------------------------- */

function newFamily(req, res, next) {
    let data = req.body
    let emp = data[0][0].substring(1)
    let query = `
    INSERT INTO employee_family_member (NATIONAL_ID_CARD_NO, is_shown ,RELATION_TYPE, FAMILY_NAME, NATIONAL_ID_NUMBER,
         BIRTH_DATE, JOB, ORGANIZATION) VALUES ${data};
    SELECT *, detofemp.EMPLOYEE_ID, detofemp.NAME_ARABIC, detofemp.NATIONAL_ID_CARD_NO FROM employee_family_member JOIN
    ( SELECT employee.EMPLOYEE_ID, employee.NAME_ARABIC, employee.NATIONAL_ID_CARD_NO FROM employee ) AS detofemp ON
     employee_family_member.NATIONAL_ID_CARD_NO = detofemp.NATIONAL_ID_CARD_NO WHERE detofemp.NATIONAL_ID_CARD_NO IN ${emp}`
    db.query(query, function (err, data) {
        if (err) {
            next(err)
            if (err.sqlMessage.indexOf("Duplicate entry") !== -1) {
                res.json({ data: [[], []], msg: "تم إدخال هذا السجل من قبل" })
            }
        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

function getEmpFamily(req, res, next) {
    let empid = req.query.empid
    let empname = req.query.empname
    let query = `SELECT *, detofemp.EMPLOYEE_ID, detofemp.NAME_ARABIC FROM employee_family_member
    JOIN(SELECT employee.EMPLOYEE_ID, employee.NAME_ARABIC, employee.NATIONAL_ID_CARD_NO FROM employee) AS detofemp
    ON employee_family_member.NATIONAL_ID_CARD_NO = detofemp.NATIONAL_ID_CARD_NO WHERE
    ${empid.length !== 0 ? `detofemp.EMPLOYEE_ID = ${empid} ` : empname || empname !== "undefined" ?
            `detofemp.NAME_ARABIC = "${empname}"` : null} and employee_family_member.is_shown = "true" `
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function editFamily(req, res, next) {
    let data = req.body.insertedData
    let id = data[data.length - 1]
    data.pop()
    let query = `UPDATE employee_family_member SET ${data} WHERE id = ${id};
    SELECT *, detofemp.EMPLOYEE_ID, detofemp.NAME_ARABIC FROM employee_family_member
    JOIN(SELECT employee.EMPLOYEE_ID, employee.NAME_ARABIC, employee.NATIONAL_ID_CARD_NO FROM employee) AS detofemp
    ON employee_family_member.NATIONAL_ID_CARD_NO = detofemp.NATIONAL_ID_CARD_NO WHERE
    employee_family_member.NATIONAL_ID_CARD_NO = ${req.body.nat} and employee_family_member.is_shown = "true"
    `
    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: null })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}


function deleteEmpFamily(req, res, next) {
    let data = req.body
    let id = data[0]
    let nat = data[1]
    let query = `
    UPDATE employee_family_member SET is_shown = "false${id}" where id = ${id};
    SELECT *, detofemp.EMPLOYEE_ID, detofemp.NAME_ARABIC FROM employee_family_member
    JOIN(SELECT employee.EMPLOYEE_ID, employee.NAME_ARABIC, employee.NATIONAL_ID_CARD_NO FROM employee) AS detofemp
    ON employee_family_member.NATIONAL_ID_CARD_NO = detofemp.NATIONAL_ID_CARD_NO WHERE
    employee_family_member.NATIONAL_ID_CARD_NO = ${nat} and employee_family_member.is_shown = "true"
    `
    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: null })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

/* --------------------end---of-----family---------------------------------- */


/* ----------------------------Penalties---------------------------------- */

function postNewPenalty(req, res, next) {
    let query = `INSERT INTO employee_penalty (NATIONAL_ID_CARD_NO, is_shown ,PENALTY_TYPE, PENALTY_DATE, PENALTY_YEAR,
    ORGANIZATION, PENALTY_REASON${req.body.length == 8 ? `,PEN_NUM` : ''}) VALUES ${req.body} `

    db.query(query, (err, data) => {
        if (err) {
            if (err.sqlMessage.indexOf("Duplicate entry") !== -1) {
                res.json({ data: [[], []], msg: "تم إدخال هذا الجزاء من قبل" })
            }
        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

function getEmpsPenalties(req, res, next) {
    let data = req.query.data
    let query = `
    SELECT
    employee.NAME_ARABIC,
    penalty_type.PENALTY_TYPE_AR,
    PENALTY_DATE,
    PEN_NUM,
    employee_penalty.NATIONAL_ID_CARD_NO,
    employee_penalty.id
FROM
    employee_penalty
JOIN employee JOIN penalty_type ON employee.NATIONAL_ID_CARD_NO = employee_penalty.NATIONAL_ID_CARD_NO AND penalty_type.PENALTY_ID
= employee_penalty.PENALTY_TYPE
WHERE
    ${data} AND employee_penalty.is_shown = "true";
    `
    db.query(query, (err, data) => {
        if (err) {

            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: null })
        } else {
            res.send(data)
        }
    })
}

function updatePenalty(req, res, next) {
    let data = req.body.filter(inf => inf != '')
    let id = data[data.length - 1]
    data.pop()
    let query = `UPDATE employee_penalty SET ${data} WHERE id = ${id}`
    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: null })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

function deletePenalty(req, res, next) {
    let id = req.query.id
    let query = `UPDATE employee_penalty SET is_shown = "false${id}" where id = ${id}`

    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: null })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

/* --------------------end----of----Penalties---------------------------------- */


/* ----------------------------Training---------------------------------- */
function postNewTraining(req, res, next) {
    let query = `INSERT INTO employee_training
    (NATIONAL_ID_CARD_NO, is_shown ,TRAINING_PROGRAM_ARABIC,TRAINING_PROGRAM_ENGLISH,TRAINING_START_DATE,
    TRAINING_COMPLETION_DATE, TRAINING_TYPE ,LOCATION_TYPE, LOCATION_NAME, ORGANIZATION) VALUES ${req.body}`
    db.query(query, (err, data) => {
        if (err) {
            if (err.sqlMessage.indexOf("Duplicate entry") !== -1) {
                res.json({ data: [[], []], msg: "تم إدخال هذا التدريب من قبل" })
            }
        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}

function getEmpTraining(req, res, next) {
    let nameOrId = req.query.nameOrId
    let query = `SELECT employee.NAME_ARABIC, employee_training.NATIONAL_ID_CARD_NO, employee_training.TRAINING_COST
    ,employee_training.TRAINING_START_DATE, employee_training.LOCATION_NAME ,employee_training.id ,
    employee_training.TRAINING_PROGRAM_ARABIC,employee_training.TRAINING_COMPLETION_DATE,TRAINING_TYPE.TRAINING_TYPE_NAME,
    LOCATION_TYPE.LOCATION_TYPE_NAME FROM employee_training JOIN TRAINING_TYPE JOIN LOCATION_TYPE JOIN employee ON
    employee.NATIONAL_ID_CARD_NO = employee_training.NATIONAL_ID_CARD_NO AND employee_training.TRAINING_TYPE = 
    training_type.TRAINING_TYPE AND
    employee_training.LOCATION_TYPE = location_type.LOCATION_TYPE WHERE ${nameOrId} AND employee_training.is_shown = "true"`
    db.query(query, (err, data) => {
        if (err) {
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: null })

        } else {
            res.send(data)
        }
    })
}

function deleteEmpTraining(req, res, next) {
    let data = req.body
    let id = data[0]
    let nat = data[1]
    let query = `
    UPDATE employee_training SET is_shown = "false${id}" where id = ${id};
    SELECT employee.NAME_ARABIC,  employee_training.NATIONAL_ID_CARD_NO, employee_training.id , 
    employee_training.TRAINING_PROGRAM_ARABIC,employee_training.TRAINING_COMPLETION_DATE,TRAINING_TYPE.TRAINING_TYPE_NAME
    ,LOCATION_TYPE.LOCATION_TYPE_NAME FROM employee_training JOIN TRAINING_TYPE JOIN LOCATION_TYPE JOIN employee ON
    employee.NATIONAL_ID_CARD_NO = employee_training.NATIONAL_ID_CARD_NO AND employee_training.TRAINING_TYPE = 
    training_type.TRAINING_TYPE AND
    employee_training.LOCATION_TYPE = location_type.LOCATION_TYPE WHERE employee_training.NATIONAL_ID_CARD_NO 
    = ${nat} AND employee_training.is_shown = "true"
    `
    db.query(query, (err, data) => {
        if (err) {
            next(err)
            res.json({ msg: "يوجد خطاء بقاعدة البيانات", data: null })

        } else {
            res.json({ msg: "تم إدخال البيانات بنجاح", data: data })
        }
    })
}
/* -------------------end---of------Training---------------------------------- */
router
    .get('/empappraisal', getEmpApprails)
    .post('/empappraisal', newAppraisal)
    .put('/appraisalupdate', updateAppraisal)
    .put('/deleteappraisal', deleteAppraisal)
    .get('/getemptrans', getEmpTrans)
    .put('/updateemptrans', updateEmpTrans)
    .put('/deletetrans', deleteTrans)
    .get('/getempedu', getEmpEdu)
    .get('/getoutsourceempedu', getOutsourceEmpEdu)
    .put('/editempedu', editEmpEdu)
    .put('/editoutsourceempedu', editOutsourceEmpEdu)
    .put('/deleteedu', deleteEdu)
    .put('/deleteoutsourceedu', deleteOutsourceEdu)
    .get('/getempfamily', getEmpFamily)
    .post('/postnewtrans', postnewtrans)
    .get('/getempexp', getEmpExprerience)
    .post('/newempexp', newEmpExp)
    .put('/editempexp', editEmpExp)
    .put('/deleteexp', deleteExperience)
    .post('/newbulktrans', postBulkTrans)
    .post('/newfamily', newFamily)
    .put('/editfamily', editFamily)
    .put('/deleteempfamily', deleteEmpFamily)
    .post('/postnewpenalty', postNewPenalty)
    .get('/getempspenalties', getEmpsPenalties)
    .put('/updatepenalty', updatePenalty)
    .put('/deletepenalty', deletePenalty)
    .get('/getemptraining', getEmpTraining)
    .put('/deleteemptraining', deleteEmpTraining)
    .post('/postnewtraining', postNewTraining)
    .post('/postnewempedu', postNewEmpEdu)

module.exports = router;