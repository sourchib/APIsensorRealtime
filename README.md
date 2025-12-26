# Greenhouse IoT Backend API

This project is a RESTful API backend for a Greenhouse IoT system, built with Express.js, PostgreSQL, and an MQTT integration for device control.

## Technology Stack

-   **Runtime**: Node.js (Express.js)
-   **Database**: PostgreSQL
-   **ORM**: Sequelize
-   **Messaging**: MQTT (Mosquitto)
-   **Frontend**: HTML5, Gauge.js (for real-time monitoring)

## Features

1.  **Sensor Data Ingestion**: Receives and stores temperature, humidity, and other sensor readings.
2.  **Device Control**: Sends commands (ON/OFF or 0/1) to IoT devices via MQTT and logs actions.
3.  **Real-time Monitoring**: Visual interface to view sensor gauges and control devices.
4.  **System Status**: Provides health monitoring for the backend, database, and MQTT connection.

## Prerequisites

-   Node.js (v22 or higher)
-   npm
-   PostgreSQL Database (installed and running locally)
-   An MQTT Broker (e.g., Mosquitto). By default, it connects to `mqtt://localhost:1883`.

## Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  **Database Setup**:
    Ensure you have PostgreSQL running. Create a database named `sensordata`:
    ```sql
    CREATE DATABASE sensordata;
    ```
    The application is configured to connect with user `postgres` and password `password`. You can change this in `config/database.js` or via environment variables.

3.  Configure Environment (Optional):
    Create a `.env` file in the root directory if you need to override defaults:
    ```env
    PORT=3000
    MQTT_BROKER_URL=mqtt://test.mosquitto.org:1883
    ```

## Running the Application

Start the server:
```bash
npm start
```
The server will run on `http://localhost:3000` (or your configured port).
The database tables will be automatically created in your PostgreSQL database upon startup.

## API Endpoints

### 1. Ingest Sensor Data
-   **URL**: `POST /sensor-data`
-   **Body**:
    ```json
    {
      "sensor_type": "temperature",
      "value": 24.5,
      "unit": "Celsius"
    }
    ```

### 2. Control Device
-   **URL**: `POST /device-control`
-   **Body**:
    ```json
    {
      "device_id": "pump",
      "command": 1
    }
    ```
    *Note: `command` can be `0` (OFF) or `1` (ON), or string `"OFF"` / `"ON"`.*
    *Supported Devices: `lamp`, `pump`, `fan`.*

-   **Effect**: 
    1. Publishes `{"device": "pump", "state": 1}` to MQTT topic `device/control`.
    2. Logs the action to the `device_logs` table (including `category` and `device_name`).
    3. Updates the `sensor_data` table for real-time UI reflection.

### 3. System Status
-   **URL**: `GET /status`
-   **Response**:
    ```json
    {
      "backend": "running",
      "database": "connected",
      "mqtt": "connected",
      "timestamp": "..."
    }
    ```

### 4. Authentication
-   **Register**: `POST /auth/register`
    -   **Body**: `{"username": "user", "password": "password", "role_id": 2}`
-   **Login**: `POST /auth/login`
    -   **Body**: `{"username": "user", "password": "password"}`
    -   **Response**: Returns `token` (JWT) and user details.

### 5. WiFi Sniffer (ESP32)
-   **Log Data**: `POST /wifi-log`
    -   **Body**:
        ```json
        {
          "ssid": "MyWiFi",
          "bssid": "00:11:22:33:44:55",
          "rssi": -65,
          "channel": 6,
          "encryption_type": "WPA2"
        }
        ```
-   **View Logs**: `GET /wifi-logs`

## Testing

You can use Postman, curl, or any API client to test the endpoints.
To test MQTT, subscribe to the topic `device/control` using an MQTT client:
```bash
mosquitto_sub -h localhost -t device/control
```
