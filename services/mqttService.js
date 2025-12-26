const mqtt = require('mqtt');
const SensorData = require('../models/SensorData');
const DeviceLog = require('../models/DeviceLog');
require('dotenv').config();

// MQTT configuration
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const options = {
    clientId: 'greenhouse_backend_' + Math.random().toString(16).substr(2, 8),
    reconnectPeriod: 1000,
};

let client = null;
let isConnected = false;

const connect = () => {
    client = mqtt.connect(MQTT_BROKER_URL, options);

    client.on('connect', () => {
        console.log(`MQTT Client connected to ${MQTT_BROKER_URL}`);
        isConnected = true;

        // Subscribe to relevant topics
        const topics = ['greenhouse/#', 'sensor/#', 'device/#'];

        topics.forEach(t => {
            client.subscribe(t, (err) => {
                if (!err) {
                    console.log(`Subscribed to topic: ${t}`);
                } else {
                    console.error(`Failed to subscribe to ${t}:`, err);
                }
            });
        });
    });

    client.on('message', async (topic, message) => {
        const msgString = message.toString();
        // Console log for debugging
        console.log(`[MQTT Received] Topic: ${topic}, Message: ${msgString}`);

        try {
            // Attempt to parse JSON
            let data;
            try {
                data = JSON.parse(msgString);
            } catch (e) {
                // Not JSON, ignore or handle plain text if needed
                return;
            }

            // 1. Strict Format: { "sensor_type": "...", "value": ... }
            if (data.sensor_type && data.value !== undefined) {
                await SensorData.create({
                    sensor_type: data.sensor_type,
                    value: data.value,
                    unit: data.unit || 'N/A'
                });
                console.log(`[DB Success] Saved MQTT data (strict format) to database.`);
            }
            // 2. Handle Device Control: { "device": "pump", "state": 1 }
            // 2. Handle Device Control: { "device": "pump", "state": 1 }
            else if (data.device && data.state !== undefined) {
                const val = Number(data.state);
                const cmdString = val === 1 ? 'ON' : 'OFF';
                const deviceStr = data.device;

                // Determine Category & Name (Mirroring controller logic)
                let category = 'General';
                let device_name = 'Unknown Device';
                let type = 'Actuator';

                if (deviceStr.includes('lamp')) {
                    category = 'Lighting';
                    device_name = 'Greenhouse Lamp';
                } else if (deviceStr.includes('pump')) {
                    category = 'Irrigation';
                    device_name = 'Water Pump';
                } else if (deviceStr.includes('fan')) {
                    category = 'Ventilation';
                    device_name = 'Ventilation Fan';
                }

                // Find/Create Device to get Integer PK
                const Device = require('../models/Device');
                const [deviceRecord] = await Device.findOrCreate({
                    where: { name: deviceStr },
                    defaults: {
                        category: category,
                        type: type
                    }
                });

                // Log to DeviceLog
                await DeviceLog.create({
                    device_id: deviceRecord.id, // Integer PK
                    device_name: device_name,
                    category: category,
                    value: val,
                    command_string: cmdString
                });

                // Update SensorData for Monitor UI
                // Supports 'lamp', 'pump', 'fan'
                if (['lamp', 'pump', 'fan'].includes(deviceStr)) {
                    await SensorData.create({
                        sensor_type: deviceStr, // matches findLatest() in monitor setup
                        value: val,
                        unit: 'state'
                    });
                }

                console.log(`[DB Success] Logged Device Control via MQTT: ${deviceStr} -> ${cmdString} (${val})`);
            }
            // 3. Flexible Format: { "temperature": 25, "humidity": 70 }
            else {
                const knownSensors = ['temperature', 'humidity', 'soil_moisture', 'light_level', 'ph', 'water_level'];
                let savedCount = 0;

                for (const [key, val] of Object.entries(data)) {
                    // Check if the key is a known sensor type (case-insensitive)
                    // and the value is a number
                    if (knownSensors.includes(key.toLowerCase()) && typeof val === 'number') {
                        await SensorData.create({
                            sensor_type: key.toLowerCase(),
                            value: val,
                            unit: 'N/A' // Default unit since it's not provided in this format
                        });
                        savedCount++;
                    }
                }

                if (savedCount > 0) {
                    console.log(`[DB Success] Saved ${savedCount} sensor readings from flexible format.`);
                }
            }
        } catch (err) {
            console.error('[MQTT processing Error]:', err.message);
        }
    });

    client.on('error', (err) => {
        console.error('MQTT Connection Error:', err);
        isConnected = false;
    });

    client.on('offline', () => {
        console.log('MQTT Client is offline');
        isConnected = false;
    });
};

const publish = (topic, message) => {
    return new Promise((resolve, reject) => {
        if (!client || !isConnected) {
            return reject(new Error('MQTT client is not connected'));
        }

        const payload = typeof message === 'string' ? message : JSON.stringify(message);

        client.publish(topic, payload, (err) => {
            if (err) {
                return reject(err);
            }
            console.log(`Published to ${topic}: ${payload}`);
            resolve(`Message published to ${topic}`);
        });
    });
};

const getStatus = () => {
    return isConnected ? 'connected' : 'disconnected';
};

module.exports = {
    connect,
    publish,
    getStatus
};
