const { Sequelize } = require('sequelize');

// Initialize PostgreSQL database using Sequelize
const sequelize = new Sequelize('sensordata', 'postgres', 'password', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false, // Set to true to see SQL queries
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = sequelize;
