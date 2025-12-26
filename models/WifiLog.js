const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WifiLog = sequelize.define('WifiLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ssid: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bssid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rssi: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    channel: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    encryption_type: {
        type: DataTypes.STRING, // e.g., WPA2, Open
        allowNull: true
    },
    scanned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'wifi_logs',
    timestamps: true
});

module.exports = WifiLog;
