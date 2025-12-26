const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Device = sequelize.define('Device', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // 'lamp', 'pump', 'fan' will go here
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING, // e.g., 'Actuator', 'Sensor'
        defaultValue: 'Actuator'
    }
}, {
    tableName: 'devices',
    timestamps: true
});

module.exports = Device;
