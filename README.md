# Greenhouse IoT Backend API

This project is a RESTful API backend for a Greenhouse IoT system, built with Express.js, PostgreSQL, and an MQTT integration for device control.

## Features

1.  **Sensor Data Ingestion**: Receives and stores temperature, humidity, and other sensor readings.
2.  **Device Control**: Sends commands (ON/OFF or 0/1) to IoT devices via MQTT and logs actions.
3.  **System Status**: Provides health monitoring for the backend, database, and MQTT connection.

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
      "device_id": "fan_01",
      "command": 1
    }
    ```
    *Note: `command` can be `0` (OFF) or `1` (ON), or string `"OFF"` / `"ON"`.*
-   **Effect**: 
    1. Publishes `{"command": "ON", "value": 1}` to MQTT topic `greenhouse/control/fan_01`.
    2. Logs the action to the `device_logs` table in the database.

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

## Testing

You can use Postman, curl, or any API client to test the endpoints.
To test MQTT, subscribe to the topic `greenhouse/control/#` using an MQTT client (like MQTT Explorer or `mosquitto_sub`) to see the messages being published.
