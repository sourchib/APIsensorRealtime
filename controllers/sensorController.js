const SensorData = require('../models/SensorData');
const Joi = require('joi');

const sensorDataSchema = Joi.object({
    sensor_type: Joi.string().required(),
    value: Joi.number().required(),
    unit: Joi.string().required(),
    timestamp: Joi.date().optional()
});

exports.ingestSensorData = async (req, res) => {
    try {
        // Validation
        const { error, value } = sensorDataSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 'error', message: error.details[0].message });
        }

        // Store in Database
        const data = await SensorData.create(value);

        return res.status(201).json({
            status: 'success',
            message: 'Sensor data recorded successfully',
            data: data
        });

    } catch (err) {
        console.error('Error ingesting sensor data:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

exports.getRecentData = async (req, res) => {
    try {
        const data = await SensorData.findAll({
            limit: 20,
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (err) {
        console.error('Error fetching sensor data:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};
