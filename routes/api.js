const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const deviceController = require('../controllers/deviceController');
const healthController = require('../controllers/healthController');
const wifiController = require('../controllers/wifiController');
const authController = require('../controllers/authController');

// 0. Authentication
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// 1. Sensor Data Ingestion
router.post('/sensor-data', sensorController.ingestSensorData);
router.get('/sensor/data', sensorController.getRecentData);

// 2. Device Control
router.post('/device-control', deviceController.controlDevice);

// 3. System Health Check
router.get('/status', healthController.getSystemStatus);

// 4. WiFi Sniffer Logs
router.post('/wifi-log', wifiController.logWifiData);
router.get('/wifi-logs', wifiController.getWifiLogs);

module.exports = router;
