// const Sequelize = require("sequelize");
// const sequelize = new Sequelize("hr_project", "root", "", {host: "127.0.0.1", dialect: "mysql", operatorsAliases: false })
// module.exports = sequelize;
// global.sequelize = sequelize

var mysql = require("mysql");

const db = mysql.createConnection({
  host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'hr_database',
  multipleStatements: true,
});
db.connect(function(err) {
  if (err) throw err;
  console.log("HrDatabase is connected");
});

pool = require('mysql').createPool({
  connectionLimit: 1000,
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
  host: "localhost",
  user: "root",
  password: 'root',
  database: "hr_database",
  multipleStatements: true,
  dateStrings: 'date',
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000,
  createDatabaseTable: true,
  endConnectionOnClose: true,
  charset: 'utf8mb4_bin',
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }

});





module.exports = pool