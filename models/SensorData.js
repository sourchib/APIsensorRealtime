const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SensorData = sequelize.define('SensorData', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sensor_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'sensor_data',
    timestamps: true
});

module.exports = SensorData;
