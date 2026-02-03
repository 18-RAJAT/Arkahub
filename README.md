# EnergyGrid Mock API

This is the mock backend server for the EnergyGrid Data Aggregator coding assignment.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Setup and Run

1.  **Navigate to the project directory:**
    ```bash
    cd mock-api
    ```
    If you already opened this repository folder directly, you can skip the `cd` step.

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    npm start
    ```
    Or directly:
    ```bash
    node server.js
    ```

4.  **Verify:**
    You should see the following output:
    ```
    ⚡ EnergyGrid Mock API running on port 3000
       Constraints: 1 req/sec, Max 10 items/batch
    ```
    The server is now listening at `http://localhost:3000`.

## Client (Data Aggregator)

This repo also includes a simple Node client in `client/` that:
- generates `SN-000` to `SN-499`
- batches 10 serials per request
- enforces a strict 1 request/sec throttle (set to 1050ms to avoid accidental `429`s)
- signs each request with `MD5(path+token+timestamp)`
- retries on `429` and transient failures
- writes one aggregated output JSON

### Run the client

1. Start the server in one terminal:
```bash
npm start
```

2. Run the client in another terminal:
```bash
npm run client
```

Output is written to `client/output.json`.

## API Details

-   **Base URL:** `http://localhost:3000`
-   **Endpoint:** `POST /device/real/query`
-   **Auth Token:** `interview_token_123`

### Security Headers Required
Every request must include:
- `timestamp`: Current time in milliseconds.
- `signature`: `MD5( URL + Token + timestamp )`

### Constraints
- **Rate Limit:** 1 request per second.
- **Batch Size:** Max 10 serial numbers per request.

See `instructions.md` for full details.
