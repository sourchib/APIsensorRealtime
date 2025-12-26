const mqtt = require('mqtt');
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
