const express = require("express");
const path = require('path');
const db = require("../database/connection")
let router = express.Router();
const multer = require('multer');
const { post } = require("jquery");
const upload = multer({ dest: './frontend/src/uploads/' })



function getsupboxmangers(req, res, next) {
    const mainid = req.params.mainid
    let query = `SELECT a_sup_box.SUP_BOX_NAME AS emp_box_name, manager.SUP_BOX_NAME AS manager_box_name,manager.SUP_BOX_ID AS manager_box_id, a_sup_box.SUP_BOX_ID AS emp_box_id, a_sup_box.SUP_BOX_NAME AS emp_box_name , latest.NAME_ARABIC FROM a_sup_box JOIN( SELECT * FROM a_sup_box ) AS manager JOIN( SELECT employee.NATIONAL_ID_CARD_NO, a_job_trans.TRANS_DATE, a_job_trans.SUP_BOX_ID, employee.NAME_ARABIC FROM a_job_trans JOIN employee ON a_job_trans.NATIONAL_ID_CARD_NO = employee.NATIONAL_ID_CARD_NO WHERE a_job_trans.INDICATOR = 2 ) AS latest ON a_sup_box.SUP_BOX_ID_P = manager.SUP_BOX_ID AND latest.SUP_BOX_ID = a_sup_box.SUP_BOX_ID WHERE a_sup_box.MAIN_BOX_ID = ${mainid}`
    db.query(query, (err, details) => {
        if (err) {
            next(err)
        } else {
            res.send(details);
        }
    })
}


function getEmpsDetails(req, res, next) {
    let query = `
    SELECT
    e.NAME_ARABIC,
    e.EMPLOYEE_ID,
    e.SECTOR_JOIN_DATE,
    dateofj.TRANS_DATE,
    emp_box.SUP_BOX_NAME,
    emp_box.MAIN_BOX_ID,
    emp_box.CAT_ID,
    emp_box.docur,
    (
    SELECT
        JOB_ASSIGNMENT_FORM_ARABIC
    FROM
        job_assignment_form
    WHERE
        job_assignment_form.JOB_ASSIGNMENT_FORM = emp_box.JOB_ASSIGNMENT_FORM
OR NULL ) AS WOG,
(
    SELECT
        CAT_NAME
    FROM
        a_category
    WHERE
        CAT_ID = emp_box.CAT_ID
OR NULL) AS cat_name,
(
    SELECT
        GOVERNORATE_ARABIC
    FROM
        governorate
    WHERE
        e.JOB_GOVERNORATE = governorate.GOVERNORATE
OR NULL ) AS jobGov,
e.JOB_LOCATION,
e.JOB_AREA,
(
    SELECT
        EMP_STATUS_NAME
    FROM
        emp_status
    WHERE
        e.EMP_STATUS = emp_status.EMP_STATUS
OR NULL) AS empstatusar,
empApp.APPRAISAL_ARABIC,
e.NATIONAL_ID_CARD_NO,
e.NATIONAL_ID_CARD_ISSUED_BY,
(
    SELECT
        GOVERNORATE_ARABIC
    FROM
        governorate
    WHERE
        e.ADDRESS_GOVERNORATE = governorate.GOVERNORATE
OR NULL) AS addressgov,
e.SOCIAL_INSURANCE_NUMBER,
e.INSURANCE_OFFICE,
e.ADDRESS,
e.PHONE_2_HOME,
e.PHONE_1_OFFICE,
e.PHONE_3_MOBILE,
e.EMP_EMAIL,
(SELECT STATUS_DESC FROM marital_status WHERE e.MARITAL_STATUS = marital_status.MARITAL_STATUS OR NULL) AS maritalstatear ,
(SELECT SYNDICATE_NAME FROM syndicate WHERE e.SYNDICATE = syndicate.SYNDICATE OR NULL) AS syndicatear ,
e.SYNDICATE_REGISTERATION,
e.SYNDICATE_REGISTERATION_DATE,
(
    SELECT
        GENDER_NAME
    FROM
        genders
    WHERE
        e.GENDER = genders.GENDER
OR NULL) AS genderar,
(
    SELECT
        RELIGION_NAME
    FROM
        religions
    WHERE
        e.RELIGION = religions.RELIGION
OR NULL) AS religinar,
e.BIRTH_DATE,
e.PLACE_OF_BIRTH,
(
    SELECT
        GOVERNORATE_ARABIC
    FROM
        governorate
    WHERE
        e.GOVERNORATE_OF_BIRTH = governorate.GOVERNORATE
OR NULL) AS birthGov
FROM
    employee e
JOIN(
    SELECT
        employee_appraisal.NATIONAL_ID_CARD_NO,
        appraisal.APPRAISAL_ARABIC,
        employee_appraisal.APPRAISAL_DATE
    FROM
        employee_appraisal
    JOIN appraisal ON appraisal.APPRAISAL = employee_appraisal.APPRAISAL OR NULL
) AS empApp
ON
    e.NATIONAL_ID_CARD_NO = empApp.NATIONAL_ID_CARD_NO OR NULL
JOIN(
    SELECT
        a_sup_box.sup_box_id,
        a_sup_box.SUP_BOX_NAME,
        a_sup_box.MAIN_BOX_ID,
        a_job_trans.NATIONAL_ID_CARD_NO,
        a_job_trans.JOB_ASSIGNMENT_FORM,
        a_main_box.CAT_ID,
        a_job_trans.TRANS_DATE as docur
    FROM
        a_sup_box
    JOIN a_job_trans JOIN a_main_box ON a_job_trans.SUP_BOX_ID = a_sup_box.SUP_BOX_ID AND a_sup_box.MAIN_BOX_ID = a_main_box.MAIN_BOX_ID OR NULL
    WHERE
        INDICATOR = 2 OR NULL
) AS emp_box
ON
    e.NATIONAL_ID_CARD_NO = emp_box.NATIONAL_ID_CARD_NO OR NULL
JOIN(
    SELECT
        NATIONAL_ID_CARD_NO,
        TRANS_DATE
    FROM
        a_job_trans
    WHERE
        JOB_ASSIGNMENT_FORM = 1 OR NULL
) AS dateofj
ON
    e.NATIONAL_ID_CARD_NO = dateofj.NATIONAL_ID_CARD_NO
    GROUP BY e.NATIONAL_ID_CARD_NO
    `


    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details)
        }
    })
}


function getEmpDetails(req, res, next) {
    let empid = req.query.empid
    let empname = req.query.empname
    let query;

    if (!empid || empid == "undefiened") {
        query = `
        SELECT
        e.RETIRE_DATE,
        e.emp_image,
        e.EMPLOYEE_ID,
        e.NAME_ARABIC,
        e.SECTOR_JOIN_DATE,
        (SELECT station_name FROM stations WHERE E.JOB_LOCATION = stations.id) as joblocation,
        (SELECT area_name FROM areas WHERE E.JOB_AREA = areas.id) as jobarea,
        (
        SELECT
            GOVERNORATE_ARABIC
        FROM
            governorate
        WHERE
            e.JOB_GOVERNORATE = governorate.GOVERNORATE
    ) AS jobGov,

    (
        SELECT
            EMP_STATUS_NAME
        FROM
            emp_status
        WHERE
            e.EMP_STATUS = emp_status.EMP_STATUS
    ) AS empstatusar,
    e.NATIONAL_ID_CARD_NO,
    e.NATIONAL_ID_CARD_ISSUED_BY,
    (
        SELECT
            GOVERNORATE_ARABIC
        FROM
            governorate
        WHERE
            e.ADDRESS_GOVERNORATE = governorate.GOVERNORATE
    ) AS addressgov,
    e.SOCIAL_INSURANCE_NUMBER,
    e.INSURANCE_OFFICE,
    e.ADDRESS,
    e.PHONE_2_HOME,
    e.PHONE_1_OFFICE,
    e.PHONE_3_MOBILE,
    e.EMP_EMAIL,
    (
        SELECT
            STATUS_DESC
        FROM
            marital_status
        WHERE
            e.MARITAL_STATUS = marital_status.MARITAL_STATUS
    ) AS maritalstatear,
    (
        SELECT
            SYNDICATE_NAME
        FROM
            syndicate
        WHERE
            e.SYNDICATE = syndicate.SYNDICATE
    ) AS syndicatear,
    e.SYNDICATE_REGISTERATION,
    e.SYNDICATE_REGISTERATION_DATE,
    (
        SELECT
            GENDER_NAME
        FROM
            genders
        WHERE
            e.GENDER = genders.GENDER
    ) AS genderar,
    (
        SELECT
            RELIGION_NAME
        FROM
            religions
        WHERE
            e.RELIGION = religions.RELIGION
    ) AS religinar,
    e.BIRTH_DATE,
    e.PLACE_OF_BIRTH,
    (
        SELECT
            GOVERNORATE_ARABIC
        FROM
            governorate
        WHERE
            e.GOVERNORATE_OF_BIRTH = governorate.GOVERNORATE
    ) AS birthGov
    FROM
        employee e
    WHERE
    NAME_ARABIC = "${empname}";
    SELECT
        a_sup_box.sup_box_id,
        a_sup_box.SUP_BOX_NAME,
        a_sup_box.box_card,
        a_sup_box.MAIN_BOX_ID,
        a_job_trans.TRANS_DATE curjobname,
        a_job_trans.JOB_ASSIGNMENT_FORM,
        a_job_trans.INDICATOR,
        job_assignment_form.JOB_ASSIGNMENT_FORM_ARABIC,
        a_main_box.CAT_ID,
        a_category.CAT_NAME,
        a_job_dgree.J_D_NAME,
        (SELECT G_NAME FROM a_job_groups WHERE a_job_groups.G_ID = a_job_trans.G_ID ) as gname

    FROM
        a_sup_box
    JOIN a_job_trans ON a_job_trans.SUP_BOX_ID = a_sup_box.SUP_BOX_ID
    JOIN a_main_box ON a_sup_box.MAIN_BOX_ID = a_main_box.MAIN_BOX_ID
    JOIN a_category ON a_main_box.CAT_ID = a_category.CAT_ID
    JOIN job_assignment_form ON a_job_trans.JOB_ASSIGNMENT_FORM = job_assignment_form.JOB_ASSIGNMENT_FORM
    JOIN a_job_dgree ON a_job_dgree.J_D_ID = a_main_box.J_D_ID
    WHERE
        INDICATOR = 2 AND NATIONAL_ID_CARD_NO =(
        SELECT
            NATIONAL_ID_CARD_NO
        FROM
            employee
        WHERE
            NAME_ARABIC = "${empname}"
    );
    SELECT
        TRANS_DATE
    FROM
        a_job_trans
    WHERE
        JOB_ASSIGNMENT_FORM = 1 AND NATIONAL_ID_CARD_NO =(
        SELECT
            NATIONAL_ID_CARD_NO
        FROM
            employee
        WHERE
            NAME_ARABIC = "${empname}"
    );
    SELECT
    TRANS_DATE as sectorjoindate
FROM
    a_job_trans
WHERE
INDICATOR = 1 AND NATIONAL_ID_CARD_NO =(
    SELECT
        NATIONAL_ID_CARD_NO
    FROM
        employee
    WHERE
        NAME_ARABIC = "${empname}"
);
        `
    } else if (!empname || empname == "undefined") {
        query = `
        SELECT
        e.RETIRE_DATE,
        e.emp_image,
        e.EMPLOYEE_ID,
        e.NAME_ARABIC,
        e.SECTOR_JOIN_DATE,
        (SELECT station_name FROM stations WHERE E.JOB_LOCATION = stations.id) as joblocation,
        (SELECT area_name FROM areas WHERE E.JOB_AREA = areas.id) as jobarea,
        (
        SELECT
            GOVERNORATE_ARABIC
        FROM
            governorate
        WHERE
            e.JOB_GOVERNORATE = governorate.GOVERNORATE
    ) AS jobGov,

    (
        SELECT
            EMP_STATUS_NAME
        FROM
            emp_status
        WHERE
            e.EMP_STATUS = emp_status.EMP_STATUS
    ) AS empstatusar,
    e.NATIONAL_ID_CARD_NO,
    e.NATIONAL_ID_CARD_ISSUED_BY,
    (
        SELECT
            GOVERNORATE_ARABIC
        FROM
            governorate
        WHERE
            e.ADDRESS_GOVERNORATE = governorate.GOVERNORATE
    ) AS addressgov,
    e.SOCIAL_INSURANCE_NUMBER,
    e.INSURANCE_OFFICE,
    e.ADDRESS,
    e.PHONE_2_HOME,
    e.PHONE_1_OFFICE,
    e.PHONE_3_MOBILE,
    e.EMP_EMAIL,
    (
        SELECT
            STATUS_DESC
        FROM
            marital_status
        WHERE
            e.MARITAL_STATUS = marital_status.MARITAL_STATUS
    ) AS maritalstatear,
    (
        SELECT
            SYNDICATE_NAME
        FROM
            syndicate
        WHERE
            e.SYNDICATE = syndicate.SYNDICATE
    ) AS syndicatear,
    e.SYNDICATE_REGISTERATION,
    e.SYNDICATE_REGISTERATION_DATE,
    (
        SELECT
            GENDER_NAME
        FROM
            genders
        WHERE
            e.GENDER = genders.GENDER
    ) AS genderar,
    (
        SELECT
            RELIGION_NAME
        FROM
            religions
        WHERE
            e.RELIGION = religions.RELIGION
    ) AS religinar,
    e.BIRTH_DATE,
    e.PLACE_OF_BIRTH,
    (
        SELECT
            GOVERNORATE_ARABIC
        FROM
            governorate
        WHERE
            e.GOVERNORATE_OF_BIRTH = governorate.GOVERNORATE
    ) AS birthGov
    FROM
        employee e
    WHERE
        EMPLOYEE_ID = ${empid};
    SELECT
        a_sup_box.sup_box_id,
        a_sup_box.SUP_BOX_NAME,
        a_sup_box.box_card,
        a_sup_box.MAIN_BOX_ID,
        a_job_trans.TRANS_DATE as curjobname ,
        a_job_trans.JOB_ASSIGNMENT_FORM,
        a_job_trans.INDICATOR,
        job_assignment_form.JOB_ASSIGNMENT_FORM_ARABIC,
        a_main_box.CAT_ID,
        a_category.CAT_NAME,
        a_job_dgree.J_D_NAME,
        (SELECT G_NAME FROM a_job_groups WHERE a_job_groups.G_ID = a_job_trans.G_ID ) as gname

    FROM
        a_sup_box
    JOIN a_job_trans ON a_job_trans.SUP_BOX_ID = a_sup_box.SUP_BOX_ID
    JOIN a_main_box ON a_sup_box.MAIN_BOX_ID = a_main_box.MAIN_BOX_ID
    JOIN a_category ON a_main_box.CAT_ID = a_category.CAT_ID
    JOIN job_assignment_form ON a_job_trans.JOB_ASSIGNMENT_FORM = job_assignment_form.JOB_ASSIGNMENT_FORM
    JOIN a_job_dgree ON a_job_dgree.J_D_ID = a_main_box.J_D_ID
    WHERE
        INDICATOR = 2 AND NATIONAL_ID_CARD_NO =(
        SELECT
            NATIONAL_ID_CARD_NO
        FROM
            employee
        WHERE
            EMPLOYEE_ID = ${empid}
    );
    SELECT
        TRANS_DATE
    FROM
        a_job_trans
    WHERE
        JOB_ASSIGNMENT_FORM = 1 AND NATIONAL_ID_CARD_NO =(
        SELECT
            NATIONAL_ID_CARD_NO
        FROM
            employee
        WHERE
            EMPLOYEE_ID = ${empid}
    );
    SELECT
    TRANS_DATE AS sectorjoindate
FROM
    a_job_trans
WHERE
    INDICATOR = 1 AND NATIONAL_ID_CARD_NO =(
    SELECT
        NATIONAL_ID_CARD_NO
    FROM
        employee
    WHERE
        EMPLOYEE_ID = ${empid}
);
        `
    }
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details)
        }
    })
}


function getOutSourceEmpDetails(req, res, next) {
    let empid = req.query.empid
    let empname = req.query.empname
    let query;

    if (!empid || empid == "undefiened") {
        query = `
        SELECT
        e.EMPLOYEE_ID,
        e.NAME_ARABIC,
        e.BIRTH_DATE,
        e.JOB,
        e.DEPARTMENT_NAME,
        (
            SELECT
                GOVERNORATE_ARABIC
            FROM
                governorate
            WHERE
                e.GOVERNORATE_OF_BIRTH = governorate.GOVERNORATE
        ) AS birthGov,
        (
            SELECT
                GENDER_NAME
            FROM
                genders
            WHERE
                e.GENDER = genders.GENDER
        ) AS genderar,
        e.NATIONAL_ID_CARD_NO,
        e.NATIONAL_ID_CARD_ISSUED_BY,
        e.ISSUE_DATE,
        e.ADDRESS,
        (SELECT G_NAME FROM a_job_groups WHERE a_job_groups.G_ID = e.JOB_GROUP ) AS jobgroup,
        (
            SELECT
                GOVERNORATE_ARABIC
            FROM
                governorate
            WHERE
                e.ADDRESS_GOVERNORATE = governorate.GOVERNORATE
        ) AS addressgov,
        e.PHONE_1_MOBILE,
        e.SECTOR_JOIN_DATE,
        (
            SELECT
                RELIGION_NAME
            FROM
                religions
            WHERE
                e.RELIGION = religions.RELIGION
        ) AS religinar,
        e.SOCIAL_INSURANCE_NUMBER,
        (SELECT STATUS_ARABIC FROM military_service_status WHERE military_service_status.MILITARY_SERVICE_STATUS = e.MILITARY_SERVICE_STATUS) as milistatusar,
        (SELECT STATUS_DESC FROM marital_status WHERE e.MARITAL_STATUS = marital_status.MARITAL_STATUS) AS maritalstatear,
        (
            SELECT
                EMP_STATUS_NAME
            FROM
                emp_status
            WHERE
                e.EMP_STATUS = emp_status.EMP_STATUS
        ) AS empstatusar,
    (
        SELECT
            GOVERNORATE_ARABIC
        FROM
            governorate
        WHERE
            e.JOB_GOVERNORATE = governorate.GOVERNORATE
    ) AS jobGov,
    (SELECT station_name FROM stations WHERE e.JOB_LOCATION = stations.id) AS joblocation,
    (SELECT area_name FROM areas WHERE e.JOB_AREA =  areas.id) as areaname,
    e.INSURANCE_OFFICE,
    e.PLACE_OF_BIRTH
    FROM
        outsource_employee e
        WHERE
        NAME_ARABIC = "${empname}"
        `
    } else if (!empname || empname == "undefined") {
        query = `
        SELECT
        e.EMPLOYEE_ID,
        e.NAME_ARABIC,
        e.BIRTH_DATE,
        e.JOB,
        e.DEPARTMENT_NAME,
        (
            SELECT
                GOVERNORATE_ARABIC
            FROM
                governorate
            WHERE
                e.GOVERNORATE_OF_BIRTH = governorate.GOVERNORATE
        ) AS birthGov,
        (
            SELECT
                GENDER_NAME
            FROM
                genders
            WHERE
                e.GENDER = genders.GENDER
        ) AS genderar,
        e.NATIONAL_ID_CARD_NO,
        e.NATIONAL_ID_CARD_ISSUED_BY,
        e.ISSUE_DATE,
        e.ADDRESS,
        (SELECT G_NAME FROM a_job_groups WHERE a_job_groups.G_ID = e.JOB_GROUP ) AS jobgroup,
        (
            SELECT
                GOVERNORATE_ARABIC
            FROM
                governorate
            WHERE
                e.ADDRESS_GOVERNORATE = governorate.GOVERNORATE
        ) AS addressgov,
        e.PHONE_3_MOBILE,
        e.SECTOR_JOIN_DATE,
        (
            SELECT
                RELIGION_NAME
            FROM
                religions
            WHERE
                e.RELIGION = religions.RELIGION
        ) AS religinar,
        e.SOCIAL_INSURANCE_NUMBER,
        (SELECT STATUS_ARABIC FROM military_service_status WHERE military_service_status.MILITARY_SERVICE_STATUS = e.MILITARY_SERVICE_STATUS) as milistatusar,
        (SELECT STATUS_DESC FROM marital_status WHERE e.MARITAL_STATUS = marital_status.MARITAL_STATUS) AS maritalstatear,
        (
            SELECT
                EMP_STATUS_NAME
            FROM
                emp_status
            WHERE
                e.EMP_STATUS = emp_status.EMP_STATUS
        ) AS empstatusar,
    (
        SELECT
            GOVERNORATE_ARABIC
        FROM
            governorate
        WHERE
            e.JOB_GOVERNORATE = governorate.GOVERNORATE
    ) AS jobGov,
    (SELECT station_name FROM stations WHERE e.JOB_LOCATION = stations.id) AS joblocation,
    (SELECT area_name FROM areas WHERE e.JOB_AREA =  areas.id) as areaname,
    e.INSURANCE_OFFICE,
    e.PLACE_OF_BIRTH
    FROM
        outsource_employee e
        WHERE
        EMPLOYEE_ID = ${empid}
        `
    }
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details)
        }
    })
}

function insertNewEmp(req, res, next) {

    const data = req.body
    const milStatusIsCompleted = data.filter(inf => inf == '(SELECT MILITARY_SERVICE_STATUS FROM military_service_status WHERE STATUS_ARABIC ="ادي الخدمه العسكرية")')
    let fData = data.filter(inf => inf != '')
    let query = `INSERT INTO employee (ORGANIZATION,EMPLOYEE_ID,NAME_ARABIC,CONTRACT_TYPE,SECTOR_JOIN_DATE,
        JOB_LOCATION,JOB_AREA,JOB_GOVERNORATE,EMP_STATUS,NATIONAL_ID_CARD_NO,NATIONAL_ID_CARD_ISSUED_BY,NATIONAL_CARD_ISSUE_DATE,SOCIAL_INSURANCE_NUMBER
        ,INSURANCE_OFFICE,RESEDNTIAL_ADDRESS,PHONE_3_MOBILE,PHONE_2_HOME,PHONE_1_OFFICE,EMP_EMAIL,MARITAL_STATUS${data[0] == 'added' ? `,SYNDICATE,SYNDICATE_REGISTERATION,
        SYNDICATE_REGISTERATION_DATE` : ''},MILITARY_SERVICE_STATUS${milStatusIsCompleted.length >= 1 ? `,MIL_SERVICE_DAYS,MIL_SERVICE_MONTHS,MIL_SERVICE_YEARS` : ''},GENDER,RELIGION,BIRTH_DATE,
        PLACE_OF_BIRTH,GOVERNORATE_OF_BIRTH) VALUES ${fData};
        SELECT
        e.EMPLOYEE_ID,
        e.NAME_ARABIC,
        e.BIRTH_DATE,
        e.JOB,
        e.DEPARTMENT_NAME,
        (
            SELECT
                GOVERNORATE_ARABIC
            FROM
                governorate
            WHERE
                e.GOVERNORATE_OF_BIRTH = governorate.GOVERNORATE
        ) AS birthGov,
        (
            SELECT
                GENDER_NAME
            FROM
                genders
            WHERE
                e.GENDER = genders.GENDER
        ) AS genderar,
        e.NATIONAL_ID_CARD_NO,
        e.NATIONAL_ID_CARD_ISSUED_BY,
        e.ISSUE_DATE,
        e.ADDRESS,
        (SELECT G_NAME FROM a_job_groups WHERE a_job_groups.G_ID = e.JOB_GROUP ) AS jobgroup,
        (
            SELECT
                GOVERNORATE_ARABIC
            FROM
                governorate
            WHERE
                e.ADDRESS_GOVERNORATE = governorate.GOVERNORATE
        ) AS addressgov,
        e.PHONE_3_MOBILE,
        e.SECTOR_JOIN_DATE,
        (
            SELECT
                RELIGION_NAME
            FROM
                religions
            WHERE
                e.RELIGION = religions.RELIGION
        ) AS religinar,
        e.SOCIAL_INSURANCE_NUMBER,
        (SELECT STATUS_ARABIC FROM military_service_status WHERE military_service_status.MILITARY_SERVICE_STATUS = e.MILITARY_SERVICE_STATUS) as milistatusar,
        (SELECT STATUS_DESC FROM marital_status WHERE e.MARITAL_STATUS = marital_status.MARITAL_STATUS) AS maritalstatear,
        (
            SELECT
                EMP_STATUS_NAME
            FROM
                emp_status
            WHERE
                e.EMP_STATUS = emp_status.EMP_STATUS
        ) AS empstatusar,
    (
        SELECT
            GOVERNORATE_ARABIC
        FROM
            governorate
        WHERE
            e.JOB_GOVERNORATE = governorate.GOVERNORATE
    ) AS jobGov,
    (SELECT station_name FROM stations WHERE e.JOB_LOCATION = stations.id) AS joblocation,
    (SELECT area_name FROM areas WHERE e.JOB_AREA =  areas.id) as areaname,
    e.INSURANCE_OFFICE,
    e.PLACE_OF_BIRTH
    FROM
        outsource_employee e
        WHERE
        EMPLOYEE_ID = ${fData[2]}
        `
    db.query(query, (err, details) => {
        if (err) {
            next(err);
            if (err.sqlMessage.indexOf("Duplicate entry") !== -1) {
                res.json({ data: [[], []], msg: "تم إدخال بيانات هذا الموظف من قبل" })
            }
        } else {
            res.json({ data, msg: "تم إدخال البيانات بنجاح" });
        }
    })

}


function insertNewOutSourceEmp(req, res, next) {
    const data = req.body

    const milStatusIsCompleted = data.filter(inf => inf == '(SELECT MILITARY_SERVICE_STATUS FROM military_service_status WHERE STATUS_ARABIC ="ادي الخدمه العسكرية")')
    let fData = data.filter(inf => inf != '')
    let query = `INSERT INTO outsource_employee (ORGANIZATION,EMPLOYEE_ID,NAME_ARABIC, CONTRACT_TYPE ,DEPARTMENT_NAME,SECTOR_JOIN_DATE,
        JOB_LOCATION,JOB_AREA,JOB_GOVERNORATE,EMP_STATUS,NATIONAL_ID_CARD_NO,NATIONAL_ID_CARD_ISSUED_BY,ISSUE_DATE,SOCIAL_INSURANCE_NUMBER
        ,INSURANCE_OFFICE,ADDRESS,PHONE_3_MOBILE,PHONE_2_HOME,PHONE_1_OFFICE,EMP_EMAIL,MARITAL_STATUS${data[0] == 'added' ? `,SYNDICATE,SYNDICATE_REGISTERATION,
        SYNDICATE_REGISTERATION_DATE` : ''},MILITARY_SERVICE_STATUS${milStatusIsCompleted.length >= 1 ? `,MIL_SERVICE_DAYS,MIL_SERVICE_MONTHS,MIL_SERVICE_YEARS` : ''},GENDER,RELIGION,BIRTH_DATE,
        PLACE_OF_BIRTH,JOB_GROUP,GOVERNORATE_OF_BIRTH) VALUES ${fData};
        SELECT
        e.EMPLOYEE_ID,
        e.NAME_ARABIC,
        e.BIRTH_DATE,
        e.JOB,
        e.DEPARTMENT_NAME,
        (
            SELECT
                GOVERNORATE_ARABIC
            FROM
                governorate
            WHERE
                e.GOVERNORATE_OF_BIRTH = governorate.GOVERNORATE
        ) AS birthGov,
        (
            SELECT
                GENDER_NAME
            FROM
                genders
            WHERE
                e.GENDER = genders.GENDER
        ) AS genderar,
        e.NATIONAL_ID_CARD_NO,
        e.NATIONAL_ID_CARD_ISSUED_BY,
        e.ISSUE_DATE,
        e.ADDRESS,
        (SELECT G_NAME FROM a_job_groups WHERE a_job_groups.G_ID = e.JOB_GROUP ) AS jobgroup,
        (
            SELECT
                GOVERNORATE_ARABIC
            FROM
                governorate
            WHERE
                e.ADDRESS_GOVERNORATE = governorate.GOVERNORATE
        ) AS addressgov,
        e.PHONE_3_MOBILE,
        e.SECTOR_JOIN_DATE,
        (
            SELECT
                RELIGION_NAME
            FROM
                religions
            WHERE
                e.RELIGION = religions.RELIGION
        ) AS religinar,
        e.SOCIAL_INSURANCE_NUMBER,
        (SELECT STATUS_ARABIC FROM military_service_status WHERE military_service_status.MILITARY_SERVICE_STATUS = e.MILITARY_SERVICE_STATUS) as milistatusar,
        (SELECT STATUS_DESC FROM marital_status WHERE e.MARITAL_STATUS = marital_status.MARITAL_STATUS) AS maritalstatear,
        (
            SELECT
                EMP_STATUS_NAME
            FROM
                emp_status
            WHERE
                e.EMP_STATUS = emp_status.EMP_STATUS
        ) AS empstatusar,
    (
        SELECT
            GOVERNORATE_ARABIC
        FROM
            governorate
        WHERE
            e.JOB_GOVERNORATE = governorate.GOVERNORATE
    ) AS jobGov,
    (SELECT station_name FROM stations WHERE e.JOB_LOCATION = stations.id) AS joblocation,
    (SELECT area_name FROM areas WHERE e.JOB_AREA =  areas.id) as areaname,
    e.INSURANCE_OFFICE,
    e.PLACE_OF_BIRTH
    FROM
        outsource_employee e
        WHERE
        EMPLOYEE_ID = ${data[2]}
        `
    db.query(query, (err, details) => {
        if (err) {
            next(err);
            res.json({ data: [], msg: "يوجد خطاء بقاعدة البيانات" })
        } else {
            res.json({ data: details, msg: "تم إدخال البيانات بنجاح" });
        }
    })
}


function updateEmpData(req, res, next) {
    let empid = req.body.employeeid
    let data = req.body.data
    let query = `
    update employee SET ${data};
    SELECT
    e.RETIRE_DATE,
    e.emp_image,
    e.EMPLOYEE_ID,
    e.NAME_ARABIC,
    e.SECTOR_JOIN_DATE,
    (SELECT station_name FROM stations WHERE E.JOB_LOCATION = stations.id) as joblocation,
    (SELECT area_name FROM areas WHERE E.JOB_AREA = areas.id) as jobarea,
    (
    SELECT
        GOVERNORATE_ARABIC
    FROM
        governorate
    WHERE
        e.JOB_GOVERNORATE = governorate.GOVERNORATE
) AS jobGov,

(
    SELECT
        EMP_STATUS_NAME
    FROM
        emp_status
    WHERE
        e.EMP_STATUS = emp_status.EMP_STATUS
) AS empstatusar,
e.NATIONAL_ID_CARD_NO,
e.NATIONAL_ID_CARD_ISSUED_BY,
(
    SELECT
        GOVERNORATE_ARABIC
    FROM
        governorate
    WHERE
        e.ADDRESS_GOVERNORATE = governorate.GOVERNORATE
) AS addressgov,
e.SOCIAL_INSURANCE_NUMBER,
e.INSURANCE_OFFICE,
e.ADDRESS,
e.PHONE_2_HOME,
e.PHONE_1_OFFICE,
e.PHONE_3_MOBILE,
e.EMP_EMAIL,
(
    SELECT
        STATUS_DESC
    FROM
        marital_status
    WHERE
        e.MARITAL_STATUS = marital_status.MARITAL_STATUS
) AS maritalstatear,
(
    SELECT
        SYNDICATE_NAME
    FROM
        syndicate
    WHERE
        e.SYNDICATE = syndicate.SYNDICATE
) AS syndicatear,
e.SYNDICATE_REGISTERATION,
e.SYNDICATE_REGISTERATION_DATE,
(
    SELECT
        GENDER_NAME
    FROM
        genders
    WHERE
        e.GENDER = genders.GENDER
) AS genderar,
(
    SELECT
        RELIGION_NAME
    FROM
        religions
    WHERE
        e.RELIGION = religions.RELIGION
) AS religinar,
e.BIRTH_DATE,
e.PLACE_OF_BIRTH,
(
    SELECT
        GOVERNORATE_ARABIC
    FROM
        governorate
    WHERE
        e.GOVERNORATE_OF_BIRTH = governorate.GOVERNORATE
) AS birthGov
FROM
    employee e
WHERE
    EMPLOYEE_ID = ${empid};
SELECT
    a_sup_box.sup_box_id,
    a_sup_box.SUP_BOX_NAME,
    a_sup_box.MAIN_BOX_ID,
    a_job_trans.TRANS_DATE,
    a_job_trans.NATIONAL_ID_CARD_NO,
    a_job_trans.JOB_ASSIGNMENT_FORM,
    a_job_trans.INDICATOR,
    job_assignment_form.JOB_ASSIGNMENT_FORM_ARABIC,
    a_main_box.CAT_ID,
    a_category.CAT_NAME,
    a_job_dgree.J_D_NAME,
    (SELECT G_NAME FROM a_job_groups WHERE a_job_groups.G_ID = a_job_trans.G_ID ) as gname

FROM
    a_sup_box
JOIN a_job_trans ON a_job_trans.SUP_BOX_ID = a_sup_box.SUP_BOX_ID
JOIN a_main_box ON a_sup_box.MAIN_BOX_ID = a_main_box.MAIN_BOX_ID
JOIN a_category ON a_main_box.CAT_ID = a_category.CAT_ID
JOIN job_assignment_form ON a_job_trans.JOB_ASSIGNMENT_FORM = job_assignment_form.JOB_ASSIGNMENT_FORM
JOIN a_job_dgree ON a_job_dgree.J_D_ID = a_main_box.J_D_ID
WHERE
    INDICATOR = 2 AND NATIONAL_ID_CARD_NO =(
    SELECT
        NATIONAL_ID_CARD_NO
    FROM
        employee
    WHERE
        EMPLOYEE_ID = ${empid}
);
SELECT
    TRANS_DATE
FROM
    a_job_trans
WHERE
    JOB_ASSIGNMENT_FORM = 1 AND NATIONAL_ID_CARD_NO =(
    SELECT
        NATIONAL_ID_CARD_NO
    FROM
        employee
    WHERE
        EMPLOYEE_ID = ${empid}
);
SELECT
TRANS_DATE AS sectorjoindate
FROM
a_job_trans
WHERE
INDICATOR = 1 AND NATIONAL_ID_CARD_NO =(
SELECT
    NATIONAL_ID_CARD_NO
FROM
    employee
WHERE
    EMPLOYEE_ID = ${empid}
);
    `
    db.query(query, (err, details) => {
        if (err) {
            next(err);
            res.json({ data: [], msg: "يوجد خطاء بقاعدة البيانات" })
        } else {
            res.json({ data: details, msg: "تم إدخال البيانات بنجاح" });
        }
    })
}

function updateOutsourceEmpData(req, res, next) {
    let data = req.body.data
    let query = `update outsource_employee SET ${data};
        SELECT
        e.EMPLOYEE_ID,
        e.NAME_ARABIC,
        e.BIRTH_DATE,
        e.JOB,
        e.DEPARTMENT_NAME,
        (
            SELECT
                GOVERNORATE_ARABIC
            FROM
                governorate
            WHERE
                e.GOVERNORATE_OF_BIRTH = governorate.GOVERNORATE
        ) AS birthGov,
        (
            SELECT
                GENDER_NAME
            FROM
                genders
            WHERE
                e.GENDER = genders.GENDER
        ) AS genderar,
        e.NATIONAL_ID_CARD_NO,
        e.NATIONAL_ID_CARD_ISSUED_BY,
        e.ISSUE_DATE,
        e.ADDRESS,
        (SELECT G_NAME FROM a_job_groups WHERE a_job_groups.G_ID = e.JOB_GROUP ) AS jobgroup,
        (
            SELECT
                GOVERNORATE_ARABIC
            FROM
                governorate
            WHERE
                e.ADDRESS_GOVERNORATE = governorate.GOVERNORATE
        ) AS addressgov,
        e.PHONE_3_MOBILE,
        e.SECTOR_JOIN_DATE,
        (
            SELECT
                RELIGION_NAME
            FROM
                religions
            WHERE
                e.RELIGION = religions.RELIGION
        ) AS religinar,
        e.SOCIAL_INSURANCE_NUMBER,
        (SELECT STATUS_ARABIC FROM military_service_status WHERE military_service_status.MILITARY_SERVICE_STATUS = e.MILITARY_SERVICE_STATUS) as milistatusar,
        (SELECT STATUS_DESC FROM marital_status WHERE e.MARITAL_STATUS = marital_status.MARITAL_STATUS) AS maritalstatear,
        (
            SELECT
                EMP_STATUS_NAME
            FROM
                emp_status
            WHERE
                e.EMP_STATUS = emp_status.EMP_STATUS
        ) AS empstatusar,
    (
        SELECT
            GOVERNORATE_ARABIC
        FROM
            governorate
        WHERE
            e.JOB_GOVERNORATE = governorate.GOVERNORATE
    ) AS jobGov,
    (SELECT station_name FROM stations WHERE e.JOB_LOCATION = stations.id) AS joblocation,
    (SELECT area_name FROM areas WHERE e.JOB_AREA =  areas.id) as areaname,
    e.INSURANCE_OFFICE,
    e.PLACE_OF_BIRTH
    FROM
        outsource_employee e
        WHERE
        EMPLOYEE_ID = ${req.body.employeeid}
    `

    db.query(query, (err, details) => {
        if (err) {
            next(err);
            res.json({ data: [], msg: "يوجد خطاء بقاعدة البيانات" })
        } else {
            res.json({ data: details, msg: "تم إدخال البيانات بنجاح" });
        }
    })
}

function getJobDgreeCodes(req, res, next) {
    const jDName = req.params.jDName
    const query = `SELECT J_D_ID FROM a_job_dgree WHERE J_D_NAME = '${jDName}'; `
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details)
        }
    })
}


function getMainCodes(req, res, next) {
    const jdId = req.params.jdid
    const query = `SELECT * FROM a_main_box JOIN a_sup_box ON a_main_box.MAIN_BOX_ID = a_sup_box.MAIN_BOX_ID JOIN a_job_dgree ON a_main_box.J_D_ID = a_job_dgree.J_D_ID WHERE a_job_dgree.J_D_ID = ${jdId};`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details)
        }
    })
}

/* ------------------cates--------------------------------------------------------*/

function getCates(req, res, next) {
    const query = `SELECT a_category.CAT_ID, CAT_NAME FROM a_category JOIN a_category_org ON a_category.CAT_ID = a_category_org.CAT_ID WHERE ORGANIZATION = 30 and is_shown = "true";`
    console.log('cates is hit');
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function insertCat(req, res, next) {

    const { catename } = req.body
    const query = `INSERT INTO a_category (CAT_NAME) VALUES ("${catename}");`
    db.query(query, (err, data) => {
        if (err) {
            next(err);
        } else {
            res.json({ data: data, msg: "تم إدخال البيانات بنجاح" })
        }
    })
}

function updateCat(req, res, next) {
    const { cateid, catename, oldCateId } = req.body
    const query = `
        UPDATE a_category SET CAT_ID = ${cateid}, CAT_NAME = "${catename}" WHERE CAT_ID = ${oldCateId};
        UPDATE a_category_org SET CAT_ID = ${cateid} WHERE CAT_ID = ${oldCateId};
        UPDATE a_job_trans SET CAT_ID = ${cateid} WHERE CAT_ID = ${oldCateId};
        UPDATE a_main_box SET CAT_ID = ${cateid} WHERE CAT_ID = ${oldCateId};
        SELECT CAT_NAME, a_category.CAT_ID FROM a_category JOIN a_category_org ON a_category.CAT_ID = a_category_org.CAT_ID WHERE ORGANIZATION = 30 and is_shown = "true";
    `
    console.log(query);
    db.query(query, (err, data) => {
        if (err) {
            next(err);
        } else {
            res.json({ data: data, msg: "تم إدخال البيانات بنجاح" })
        }
    })
}

function deleteCat(req,res,next){
    const { cateid } = req.body
    const query = `UPDATE a_category_org SET is_shown = "false_${cateid}" WHERE CAT_ID = ${cateid};
    SELECT CAT_NAME, a_category.CAT_ID FROM a_category JOIN a_category_org ON a_category.CAT_ID = a_category_org.CAT_ID WHERE ORGANIZATION = 30 and is_shown = "true";
    `
    db.query(query, (err, data) => {
        if (err) {
            next(err);
        } else {
            res.json({ data: data, msg: "تم حذف البيانات بنجاح" })
        }
    })
    
}

function addCatOrg(req, res, next) {
    const { catid } = req.body
    const query = `INSERT INTO a_category_org (CAT_ID, ORGANIZATION) VALUES (${catid}, 30);
    SELECT CAT_NAME, a_category.CAT_ID FROM a_category JOIN a_category_org ON a_category.CAT_ID = a_category_org.CAT_ID WHERE ORGANIZATION = 30;
    `

    db.query(query, (err, data) => {
        if (err) {
            next(err);
        } else {
            res.json({ data, msg: "تم إدخال البيانات بنجاح" })
        }
    })
}

/* ------------------cates--------------------------------------------------------*/

function getEmpNameById(req, res, next) {
    const empid = req.params.empid
    // const query = `SELECT employee.NAME_ARABIC, employee.EMPLOYEE_ID ,employee.NATIONAL_ID_CARD_NO ,empmainbox.SUP_BOX_NAME, empmainbox.MAIN_BOX_ID, employee.NATIONAL_ID_CARD_NO FROM employee JOIN (SELECT a_job_trans.SUP_BOX_ID, a_sup_box.SUP_BOX_NAME , a_job_trans.NATIONAL_ID_CARD_NO, a_sup_box.MAIN_BOX_ID FROM a_job_trans JOIN a_sup_box ON a_job_trans.SUP_BOX_ID = a_sup_box.SUP_BOX_ID WHERE a_job_trans.INDICATOR = 2 ) AS empmainbox ON employee.NATIONAL_ID_CARD_NO = empmainbox.NATIONAL_ID_CARD_NO WHERE EMPLOYEE_ID = ${empid}`
    let query = `SELECT NAME_ARABIC FROM employee WHERE EMPLOYEE_ID = ${empid}`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function getEmpNameByName(req, res, next) {
    let empname = req.params.empname
    let query = `SELECT NAME_ARABIC, EMPLOYEE_ID, NATIONAL_ID_CARD_NO FROM employee WHERE NAME_ARABIC  LIKE "%${empname}%"`
    db.query(query, (err, details) => {
        if (err) {

            next(err);
        } else {
            res.send(details);
        }
    })
}

function getOutsourceEmpNameByName(req, res, next) {
    let empname = req.params.empname
    let query = `SELECT NAME_ARABIC, EMPLOYEE_ID, NATIONAL_ID_CARD_NO FROM outsource_employee WHERE NAME_ARABIC  LIKE "%${empname}%"`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}


function getQulSpeciality(req, res, next) {
    let specarabic = req.query.specarabic
    let query = `SELECT SPECIALITY_ARABIC FROM dgree_speciality WHERE SPECIALITY_ARABIC LIKE "%${specarabic}%";`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function getSpecDetail(req, res, next) {

    let specDetail = req.query.specDetail;
    let query = `SELECT SPECIALITY_DETAIL_ARABIC FROM dgree_speciality_detail WHERE SPECIALITY_DETAIL_ARABIC LIKE "%${specDetail}%";`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })

}

function getUneSchool(req, res, next) {
    let uneschool = req.query.uneschool
    let query = `SELECT UNIVERSITY_SCHOOL_ARABIC FROM university_school WHERE UNIVERSITY_SCHOOL_ARABIC LIKE "%${uneschool}%" `
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}


function getStations(req, res, next) {
    db.query('SELECT * FROM stations', (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function getMaincode(req, res, next) {
    const jdid = req.params.jdid
    const catid = req.params.catid
    const query = `SELECT MAIN_BOX_ID FROM a_main_box WHERE J_D_ID = ${jdid} and CAT_ID = ${catid} `
    db.query(query, (err, details) => {
        if (err) {
            next(err)
        } else {
            res.send(details);
        }

    })
}

function getUpJd(req, res, next) {
    const catename = req.params.catename
    const supboxname = req.params.supboxname
    let query = `CALL GTT(10, (SELECT SUP_BOX_ID FROM a_sup_box WHERE SUP_BOX_NAME = "${supboxname}" AND MAIN_BOX_ID =
    (SELECT a_main_box.MAIN_BOX_ID FROM a_main_box JOIN a_sup_box ON a_main_box.MAIN_BOX_ID =
        a_sup_box.MAIN_BOX_ID WHERE a_sup_box.SUP_BOX_NAME = "${supboxname}" AND a_main_box.CAT_ID =
         (SELECT CAT_ID FROM a_category WHERE CAT_NAME = "${catename}"))))`

    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details.reverse());
        }
    })
}

function getAvailSupBox(req, res, next) {
    const catname = req.params.catname
    const jdname = req.params.jdname

    let query = `SELECT SUP_BOX_NAME, SUP_BOX_ID from a_sup_box WHERE MAIN_BOX_ID IN(SELECT a_main_box.MAIN_BOX_ID FROM a_main_box JOIN a_job_dgree JOIN a_category ON a_main_box.J_D_ID = a_job_dgree.J_D_ID AND a_main_box.CAT_ID = a_category.CAT_ID WHERE a_category.CAT_NAME = "${catname}" AND a_job_dgree.J_D_NAME = "${jdname}")`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function getSupBoxNames(req, res, next) {
    const jdid = req.params.jdid
    const catid = req.params.catid
    const query = `SELECT * FROM a_sup_box WHERE MAIN_BOX_ID IN (SELECT MAIN_BOX_ID FROM A_MAIN_BOX WHERE J_D_ID = ${jdid} AND CAT_ID = ${catid})`
    db.query(query, (err, details) => {
        if (err) {
            next(err)
        } else {
            res.send(details);
        }
    })
}

function getJobDgByCatForOrgStructure(req, res, next) {
    const catid = req.query.catid
    const query = `SELECT *, (SELECT CAT_NAME FROM a_category WHERE a_category.CAT_ID = a_main_box.CAT_ID) AS catename FROM a_job_dgree JOIN a_main_box ON a_job_dgree.J_D_ID = a_main_box.J_D_ID WHERE a_main_box.CAT_ID = ${catid} and is_shown = "true"`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })

}

function getEmpAvljd(req, res, next) {
    const catname = req.params.catname;
    const mainboxid = req.params.mainboxid
    let d = `WHERE id < 5
ORDER BY id DESC
LIMIT 1`
    let query1 = `SELECT SUP_BOX_NAME from a_sup_box WHERE MAIN_BOX_ID IN (SELECT a_main_box.MAIN_BOX_ID FROM a_main_box JOIN a_job_dgree JOIN a_category ON a_main_box.J_D_ID = a_job_dgree.J_D_ID AND a_main_box.CAT_ID = a_category.CAT_ID WHERE a_category.CAT_NAME = "${catname}" AND a_job_dgree.J_D_NAME = "${jdname}")`

    let query = `SELECT * FROM a_job_dgree JOIN( SELECT a_main_box.CAT_ID, a_main_box.J_D_ID, a_category.CAT_NAME FROM a_main_box JOIN a_category ON a_category.CAT_ID = a_main_box.CAT_ID ) AS maincate ON a_job_dgree.J_D_ID = maincate.J_D_ID WHERE maincate.CAT_NAME = "${catname}" AND a_job_dgree.J_D_ID = ${mainboxid} ORDER BY a_job_dgree.J_D_ID LIMIT 1`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function getCurrentJD(req, res, next) {
    let empid = req.params.empid
    let query = `SELECT
    *
FROM
    a_job_trans
JOIN employee JOIN(
    SELECT
        a_main_box.J_D_ID,
        a_job_dgree.J_D_NAME,
        a_job_dgree.J_D_ID_P,
        a_main_box.MAIN_BOX_ID
    FROM
        a_main_box
    JOIN a_job_dgree ON a_job_dgree.J_D_ID = a_main_box.J_D_ID 
) AS latestjobdg JOIN a_sup_box 
ON
    a_job_trans.NATIONAL_ID_CARD_NO = employee.NATIONAL_ID_CARD_NO AND latestjobdg.MAIN_BOX_ID = a_job_trans.MAIN_BOX_ID AND a_sup_box.SUP_BOX_ID = a_job_trans.SUP_BOX_ID 
WHERE
    employee.EMPLOYEE_ID = ${empid} AND a_job_trans.INDICATOR = 2 `
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function getJobDgByCat(req, res, next) {
    const catName = req.params.catname
    const query = `SELECT *, (select CAT_NAME FROM a_category WHERE a_main_box.CAT_ID = a_category.CAT_ID) AS catename FROM a_job_dgree JOIN a_main_box ON a_job_dgree.J_D_ID = a_main_box.J_D_ID WHERE a_main_box.CAT_ID = (SELECT CAT_ID FROM a_category WHERE CAT_NAME = "${catName}");`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })

}

function getJobDgree(req, res, next) {
    const query = `SELECT * FROM a_job_dgree;`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function addToMainBox(req, res, next) {
    const { catid, jdid, jdidp, joblevel } = req.body


    const query = `
    INSERT INTO a_main_box (CAT_ID, J_D_ID, J_D_ID_P, JOB_LEVEL ,ORGANIZATION) VALUES (${catid}, ${jdid}, ${jdidp}, ${joblevel} ,30);
    SELECT *, (SELECT CAT_NAME FROM a_category WHERE a_category.CAT_ID = a_main_box.CAT_ID) AS catename FROM a_job_dgree JOIN a_main_box ON a_job_dgree.J_D_ID = a_main_box.J_D_ID WHERE a_main_box.CAT_ID = ${catid} AND is_shown = "true";
    `
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function deleteFromMainBox(req, res, next) {
    const { mainboxid, catid, jdid } = req.body
    const query = `
    UPDATE a_main_box SET is_shown = "${mainboxid}false" where MAIN_BOX_ID = ${mainboxid};
    SELECT *, (SELECT CAT_NAME FROM a_category WHERE a_category.CAT_ID = a_main_box.CAT_ID) AS catename FROM a_job_dgree JOIN a_main_box ON a_job_dgree.J_D_ID = a_main_box.J_D_ID WHERE a_main_box.CAT_ID = ${catid} AND is_shown = "true";
    `
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function getAssisstantDepartment(req, res, next) {
    const query = `SELECT *, (select CAT_NAME FROM a_category where a_category.CAT_ID = a_sup_category.Public_Administration) as CAT_NAME FROM a_sup_category`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function addAssisstantDepartment(req, res, next) {
    const { catename, assisstantcatename } = req.body
    const query = `INSERT INTO a_sup_category (General_Administration_Assistant, Public_Administration) VALUES ("${assisstantcatename}", (select CAT_ID FROM a_category WHERE CAT_NAME = "${catename}"));
    SELECT *, (select CAT_NAME FROM a_category where a_category.CAT_ID = a_sup_category.Public_Administration) as CAT_NAME FROM a_sup_category
    `
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })

}

function getSupbox(req, res, next) {
    const query = `SELECT 
    a_sup_box.SUP_BOX_NAME AS emp_box_name,
    (SELECT 
            CAT_NAME
        FROM
            a_category
        WHERE
	a_main_box.CAT_ID = a_category.CAT_ID) AS catename,
    (SELECT J_D_NAME FROM a_job_dgree where a_main_box.J_D_ID = a_job_dgree.J_D_ID) AS jdname,
    manager.SUP_BOX_NAME AS manager_box_name,
    a_sup_box.ACTIV_NOT,
    a_sup_box.VAC_NOT,
    a_sup_box.G_ID,
    a_sup_box.SUP_BOX_ID AS emp_box_id
FROM
    (SELECT 
        *
    FROM
        a_sup_box) AS manager
        JOIN
    a_sup_box
        JOIN
    a_main_box ON a_sup_box.SUP_BOX_ID_P = manager.SUP_BOX_ID
        AND a_sup_box.MAIN_BOX_ID = a_main_box.MAIN_BOX_ID`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function addChairmanAssisstant(req, res, next) {
    const { chairmanAssisstant } = req.body
    const query = `insert into chairman_assisstant (ca_name) values ("${chairmanAssisstant}");
    select * from chairman_assisstant where is_shown = "true";
    `
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function getChairmanAssisstant(req, res, next) {
    const query = `select * from chairman_assisstant where is_shown = "true";`
    db.query(query, (err, details) => {
        if (err) {
            next(err);
        } else {
            res.send(details);
        }
    })
}

function editeChairmanAssistant(req,res,next) {
    
    const {caname, id} = req.body
    const query = `UPDATE chairman_assisstant SET ca_name = "${caname}" where id = ${id};
    select * from chairman_assisstant where is_shown = "true";
    `
    db.query(query, (err,details) => {
        console.log(details);
        if(err) {
            next(err);
        }else{
            res.json(details)
        }
    })
}

function removeChairmanAssistant(req,res,next) {
    const {id} = req.body
    const query = `UPDATE chairman_assisstant SET is_shown = "${id}_false" where id = ${id};
    select * from chairman_assisstant where is_shown = "true";
    `
    db.query(query, (err,details) => {
        if(err) {
            next(err);
        }else{
            console.log(details);

            res.json(details)
        }
    })}

function addDepToAssistant(req,res,next) {
    const {caid, catid} = req.body
    const query = `UPDATE a_category_org SET ca_id = ${caid} WHERE CAT_ID = ${catid};
    SELECT *, (SELECT CAT_NAME FROM a_category where a_category.CAT_ID = a_category_org.CAT_ID) AS catname FROM a_category_org WHERE ca_id = ${caid};
    `
    db.query(query, (err,details) => {
        if(err) {
            next(err);
        }else{
            res.send(details)
        }
    })
}

function getChairmanDeps(req,res,next){
    const { caid } = req.query

    const query = `SELECT *, (SELECT CAT_NAME FROM a_category where a_category.CAT_ID = a_category_org.CAT_ID) AS catname FROM a_category_org WHERE ca_id = ${caid};`
    db.query(query, (err,details) => {
        if(err) {
            next(err);
        }else{
            res.send(details)
        }
    })
}

function delDepFA(req,res,next) {
    const {caid, catid} = req.body
    const query = `UPDATE a_category_org SET ca_id = NULL WHERE CAT_ID = ${catid};
    SELECT *, (SELECT CAT_NAME FROM a_category where a_category.CAT_ID = a_category_org.CAT_ID) AS catname FROM a_category_org WHERE ca_id = ${caid};
    `
    db.query(query, (err,details) => {
        if(err) {
            next(err);
        }else{
            res.send(details);
        }
    })
}



router
    .get('/getJobdgbycatfororgstructure', getJobDgByCatForOrgStructure)
    .get(`/getsupboxnames/:jdid /:catid`, getSupBoxNames)
    .get('/getavailsupbox/:catname/:jdname', getAvailSupBox)
    .get('/getUpJd/:catename/:supboxname', getUpJd)
    .get(`/getmaincode/:jdid/:catid`, getMaincode)
    .get(`/getboxandmangers/:mainid`, getsupboxmangers)
    .get('/getjobdgreecodes/:jDName', getJobDgreeCodes)
    .get('/getmaincodes/:jdid', getMainCodes)
    .get('/category', getCates)
    .post('/category', insertCat)
    .put('/category', updateCat)
    .put('/deletecategory', deleteCat)
    .post('/cateorg', addCatOrg)
    .get('/empnamebyid/:empid', getEmpNameById)
    .get('/empnamebyName/:empname', getEmpNameByName)
    .get('/outsourceempnamebyName/:empname', getOutsourceEmpNameByName)
    .get('/specarabic', getQulSpeciality)
    .get('/stations', getStations)
    .get('/specDetail', getSpecDetail)
    .get('/uneschool', getUneSchool)
    .post('/insertnewemp', insertNewEmp)
    .post('/insertempimg', upload.single('avatar'), (req, res, next) => {


    })
    .post('/insertnewoutsourceemp', insertNewOutSourceEmp)
    .put('/updateempdata', updateEmpData)
    .put('/updateoutsourceempdata', updateOutsourceEmpData)
    .get('/getempdetails', getEmpDetails)
    .get('/outsourceempdetails', getOutSourceEmpDetails)
    .get('/currentjd/:empid', getCurrentJD)
    .get('/getjobdgbycat/:catname', getJobDgByCat)
    .get('/availjd/:catname/:jdname', getEmpAvljd)
    .get('/getempsdetails', getEmpsDetails)
    .get('/getjobdgree', getJobDgree)
    .post('/mainbox', addToMainBox)
    .put('/mainbox', deleteFromMainBox)
    .get('/getassisstantdepartment', getAssisstantDepartment)
    .post('/addassisstantdepartment', addAssisstantDepartment)
    .get('/getsupbox', getSupbox)
    .post('/addchairmanassisstant', addChairmanAssisstant)
    .get('/getchairmanassisstant', getChairmanAssisstant)
    .put('/editechairmanassistant',editeChairmanAssistant)
    .put('/removechairmanassistant', removeChairmanAssistant)
    .get('/getchairmandeps', getChairmanDeps)
    .post('/adddeptoassistant', addDepToAssistant)
    .put('/deldepfa', delDepFA)




module.exports = router;