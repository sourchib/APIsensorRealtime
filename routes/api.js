const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const deviceController = require('../controllers/deviceController');
const healthController = require('../controllers/healthController');

// 1. Sensor Data Ingestion
router.post('/sensor-data', sensorController.ingestSensorData);
router.get('/sensor/data', sensorController.getRecentData);

// 2. Device Control
router.post('/device-control', deviceController.controlDevice);

// 3. System Health Check
router.get('/status', healthController.getSystemStatus);

module.exports = router;
