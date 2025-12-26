const WifiLog = require('../models/WifiLog');
const Joi = require('joi');

const wifiLogSchema = Joi.object({
    ssid: Joi.string().allow(null, '').optional(),
    bssid: Joi.string().required(),
    rssi: Joi.number().integer().required(),
    channel: Joi.number().integer().optional(),
    encryption_type: Joi.string().allow(null, '').optional()
});

exports.logWifiData = async (req, res) => {
    try {
        // Validation
        const { error, value } = wifiLogSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 'error', message: error.details[0].message });
        }

        // Create log entry
        const log = await WifiLog.create({
            ssid: value.ssid,
            bssid: value.bssid,
            rssi: value.rssi,
            channel: value.channel,
            encryption_type: value.encryption_type,
            scanned_at: new Date()
        });

        return res.status(201).json({
            status: 'success',
            message: 'WiFi log saved successfully',
            data: log
        });

    } catch (err) {
        console.error('Error logging WiFi data:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

exports.getWifiLogs = async (req, res) => {
    try {
        const logs = await WifiLog.findAll({
            limit: 100,
            order: [['scanned_at', 'DESC']]
        });

        return res.status(200).json({
            status: 'success',
            data: logs
        });
    } catch (err) {
        console.error('Error fetching WiFi logs:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};
