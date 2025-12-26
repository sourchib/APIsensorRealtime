const mqttService = require('../services/mqttService');
const DeviceLog = require('../models/DeviceLog');
const Joi = require('joi');

const deviceControlSchema = Joi.object({
    device_id: Joi.string().required(),
    command: Joi.alternatives().try(
        Joi.string().valid('ON', 'OFF'),
        Joi.number().valid(0, 1)
    ).required()
});

exports.controlDevice = async (req, res) => {
    try {
        // Validation
        const { error, value } = deviceControlSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 'error', message: error.details[0].message });
        }

        let { device_id, command } = value;

        // Normalize command to 0/1 and string
        let numericValue;
        let stringValue;

        if (command === 'ON' || command === 1) {
            numericValue = 1;
            stringValue = 'ON';
        } else {
            numericValue = 0;
            stringValue = 'OFF';
        }

        const topic = `greenhouse/control/${device_id}`;
        const payload = { command: stringValue, value: numericValue };

        // 1. Publish to MQTT
        await mqttService.publish(topic, payload);

        // 2. Log to Database
        await DeviceLog.create({
            device_id: device_id,
            value: numericValue,
            command_string: stringValue
        });

        return res.status(200).json({
            status: 'success',
            message: `Command '${stringValue}' (val: ${numericValue}) sent to device '${device_id}' and logged to DB`,
            topic: topic,
            stored_value: numericValue
        });

    } catch (err) {
        console.error('Error controlling device:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to send command' });
    }
};
