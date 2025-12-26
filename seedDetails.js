const sequelize = require('./config/database');
const SensorData = require('./models/SensorData');

const seedData = async () => {
    try {
        await sequelize.sync();

        const sensors = [
            { sensor_type: 'temperature', value: 28, unit: 'C' },
            { sensor_type: 'humidity', value: 70, unit: '%' },
            { sensor_type: 'soil_moisture', value: 45, unit: '%' },
            { sensor_type: 'light_level', value: 650, unit: 'Lux' },
            { sensor_type: 'lamp', value: 1, unit: 'state' }
        ];

        for (const s of sensors) {
            await SensorData.create(s);
            console.log(`Seeded ${s.sensor_type}: ${s.value}`);
        }

        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedData();
