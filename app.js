var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const sequelize = require('./config/database');
const mqttService = require('./services/mqttService');
const apiRouter = require('./routes/api');

// Import Models for Associations
const Device = require('./models/Device');
const DeviceLog = require('./models/DeviceLog');
const Role = require('./models/Role');
const User = require('./models/User');
const WifiLog = require('./models/WifiLog'); // Registered for DDL generation

// Define Relationships
Device.hasMany(DeviceLog, { foreignKey: 'device_id' });
DeviceLog.belongsTo(Device, { foreignKey: 'device_id' });

Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

var app = express();

// Database Synchronization
sequelize.sync({ alter: true }).then(async () => {
  console.log('Database synced (Schema Updated)');

  // Seed Roles
  try {
    await Role.findOrCreate({ where: { id: 1 }, defaults: { name: 'admin', description: 'Can manage dashboard, CRUD logs' } });
    await Role.findOrCreate({ where: { id: 2 }, defaults: { name: 'customer', description: 'Can monitor temp and devices' } });
    console.log('Roles seeded');
  } catch (err) { console.error('Role seeding error:', err); }

  // Seed Default Users (Demo)
  try {
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) await User.create({ username: 'admin', password: 'adminpassword', role_id: 1 });

    const userExists = await User.findOne({ where: { username: 'user' } });
    if (!userExists) await User.create({ username: 'user', password: 'userpassword', role_id: 2 });
    console.log('Users seeded');
  } catch (err) { console.error('User seeding error:', err); }

  // Seed Devices
  const Device = require('./models/Device');
  try {
    await Device.bulkCreate([
      { name: 'lamp', category: 'Lighting', type: 'Actuator' },
      { name: 'pump', category: 'Irrigation', type: 'Actuator' },
      { name: 'fan', category: 'Ventilation', type: 'Actuator' }
    ], { ignoreDuplicates: true });
    console.log('Devices seeded successfully');
  } catch (err) {
    console.error('Seeding error:', err);
  }

}).catch(err => {
  console.error('Failed to sync database:', err);
});

// MQTT Connection
mqttService.connect();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Serve Sensor Monitor View
app.get('/monitor', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'monitor.html'));
});

// Mount API routes
app.use('/', apiRouter);

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
