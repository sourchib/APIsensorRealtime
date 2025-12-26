# System Architecture & Design Logic

## 1. System Architecture

The system follows a **Layered Architecture** pattern to ensure separation of concerns, scalability, and maintainability.

-   **Routes Layer (`routes/`)**: Defines the API endpoints and delegates requests to controllers.
-   **Controller Layer (`controllers/`)**: Handles incoming HTTP requests, performs input validation (using `Joi`), and sends responses. It acts as the orchestrator.
-   **Service Layer (`services/`)**: Encapsulates business logic and external integrations. Specifically, `mqttService.js` handles all MQTT-related complexities.
-   **Data Access Layer (`models/` & `config/`)**: Manages database interactions. We use **Sequelize** as an ORM to interact with **PostgreSQL**. This abstracts raw SQL queries and allows for easy schema management.

### Data Flow
1.  **Sensor Data**: IoT Sensor -> HTTP POST -> Controller -> Validation -> Model -> PostgreSQL Database.
2.  **Device Control**: User/Client -> HTTP POST -> Controller -> Validation -> MQTT Service -> MQTT Broker -> IoT Device.

## 2. MQTT Integration

The system uses the `mqtt` library for Node.js.
-   **Connection**: The backend maintains a persistent connection to the MQTT broker initiated at startup.
-   **Publishing**: When a control request is received, the `mqttService` publishes a JSON payload to a specific topic structure: `greenhouse/control/{device_id}`.
-   **Reliability**: The service includes basic event listeners for `connect`, `error`, and `offline` to track connection status.

## 3. Error Handling & Edge Cases

-   **Input Validation**: All incoming data is strictly validated using `Joi`. Invalid data results in a `400 Bad Request` with specific error details, preventing bad data from entering the system.
-   **Database Failures**: Key database operations are wrapped in `try-catch` blocks. If the DB is unreachable, a `500 Internal Server Error` is returned, and the error is logged.
-   **MQTT Disconnection**: If the MQTT broker is down, the `/device-control` endpoint will catch the error and return a `500` status, informing the user that the command could not be sent. The `/status` endpoint will explicitly report the MQTT status as `disconnected`.
-   **Type Safety**: The database schema ensures data consistency (e.g., non-null fields, correct data types).

## 4. Design Decisions

-   **PostgreSQL**: Chosen for its reliability, robustness, and support for complex queries, making it suitable for handling sensor data time-series in a production environment.
-   **Sequelize ORM**: Used to provide a structured way to define models and handle migrations, making the codebase "production-ready" and extensible.
-   **Separation of Concerns**: Logic is not dumped into `app.js` or routes. Services handle external comms, controllers handle HTTP logic, models handle data. This makes unit testing easier.
-   **Health Check**: Critical for orchestrators (like Kubernetes) or monitoring tools to know if the service is actually healthy, not just if the process is running.

---
*This document serves as the basis for the Design & Logic presentation.*
