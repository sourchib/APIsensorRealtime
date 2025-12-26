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

        const topic = 'device/control';
        const payload = { device: device_id, state: numericValue };

        // 1. Publish to MQTT
        // JSON.stringify is handled by mqttService if it expects an object, 
        // but often it expects a string or buffer. 
        // Based on typical usage, we usually stringify JSON payloads.
        await mqttService.publish(topic, JSON.stringify(payload));

        // Determine Category and Device Name
        let category = 'General';
        let device_name = 'Unknown Device';

        if (device_id.includes('lamp')) {
            category = 'Lighting';
            device_name = 'Greenhouse Lamp';
        } else if (device_id.includes('pump')) {
            category = 'Irrigation';
            device_name = 'Water Pump';
        } else if (device_id.includes('fan')) {
            category = 'Ventilation';
            device_name = 'Ventilation Fan';
        }

        // 2. Log to Database (DeviceLog for command history)
        await DeviceLog.create({
            device_id: device_id,
            device_name: device_name,
            category: category,
            value: numericValue,
            command_string: stringValue
        });

        // 3. Update SensorData for Real-time Monitor (for lamp, pump, etc.)
        // We persist the state so the monitor endpoint (/sensor/data) can pick it up.
        if (['lamp', 'pump', 'fan'].includes(device_id)) {
            const SensorData = require('../models/SensorData'); // Lazy load
            await SensorData.create({
                sensor_type: device_id,
                value: numericValue,
                unit: 'state'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: `Command '${stringValue}' (val: ${numericValue}) sent to device '${device_id}'`,
            topic: topic,
            stored_value: numericValue
        });

    } catch (err) {
        console.error('Error controlling device:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to send command' });
    }
};
