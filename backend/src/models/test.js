const { Sequelize } = require('sequelize');


const sequelize = new Sequelize('hr_database', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize.define("mezo", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    content: Sequelize.STRING(300)
});

