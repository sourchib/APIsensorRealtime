const sequelize = require('../config/database');
const mqttService = require('../services/mqttService');

exports.getSystemStatus = async (req, res) => {
    let dbStatus = 'unknown';

    // Check Database
    try {
        await sequelize.authenticate();
        dbStatus = 'connected';
    } catch (error) {
        dbStatus = 'disconnected';
        console.error('DB Connection Error:', error);
    }

    // Check MQTT
    const mqttStatus = mqttService.getStatus();

    const status = {
        backend: 'running',
        database: dbStatus,
        mqtt: mqttStatus,
        timestamp: new Date()
    };

    // If any critical service is down, maybe return 503, but assignment just says report status. 
    // Usually 200 with status info is fine for a status page.
    res.json(status);
};
