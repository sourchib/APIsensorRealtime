const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeviceLog = sequelize.define('DeviceLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    device_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isIn: [[0, 1]] // Only allow 0 or 1
        }
    },
    command_string: {
        type: DataTypes.STRING, // To store the original "ON"/"OFF" representation for readability if needed
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'device_logs',
    timestamps: true
});

module.exports = DeviceLog;
