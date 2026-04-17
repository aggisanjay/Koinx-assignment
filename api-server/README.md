# api-server

The **api-server** is a Node.js/Express HTTP server that:

- Connects to **MongoDB** to store and query cryptocurrency statistics.
- Subscribes to a **NATS** message queue; on each `{ trigger: "update" }` event it fetches fresh stats from CoinGecko and persists them.
- Exposes two REST endpoints: `/stats` and `/deviation`.

---

## Prerequisites

| Dependency | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| NATS server | 2.x (see root `docker-compose.yml`) |
| MongoDB Atlas | any recent version |

---

## Setup

### 1. Install dependencies

```bash
cd api-server
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/koinx?retryWrites=true&w=majority
NATS_URL=nats://localhost:4222
COINGECKO_API_KEY=your_api_key_here   # from https://www.coingecko.com/en/api
PORT=3000
```

### 3. Start NATS (from the project root)

```bash
docker compose up -d
```

### 4. Run the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

---

## API Reference

### `GET /stats`

Returns the **latest** price statistics for a given coin.

**Query Parameters**

| Parameter | Type | Required | Values |
|---|---|---|---|
| `coin` | string | ✅ | `bitcoin`, `ethereum`, `matic-network` |

**Example Request**

```
GET /stats?coin=bitcoin
```

**Example Response `200 OK`**

```json
{
  "price": 40000,
  "marketCap": 800000000,
  "24hChange": 3.4
}
```

**Error Responses**

| Status | Reason |
|---|---|
| `400` | Invalid or missing `coin` parameter |
| `404` | No data found yet for the coin |

---

### `GET /deviation`

Returns the **standard deviation** of the price for the last 100 stored records.

**Query Parameters**

| Parameter | Type | Required | Values |
|---|---|---|---|
| `coin` | string | ✅ | `bitcoin`, `ethereum`, `matic-network` |

**Example Request**

```
GET /deviation?coin=bitcoin
```

**Example Response `200 OK`**

```json
{
  "deviation": 4082.48
}
```

---

### `GET /health`

Returns `200 OK` if the server is running.

---

## Project Structure

```
api-server/
├── src/
│   ├── config/
│   │   ├── db.js            # MongoDB connection
│   │   └── nats.js          # NATS subscriber
│   ├── controllers/
│   │   └── cryptoController.js
│   ├── models/
│   │   └── CryptoStat.js    # Mongoose schema
│   ├── routes/
│   │   └── crypto.js
│   ├── services/
│   │   └── cryptoService.js # storeCryptoStats()
│   └── index.js             # Entry point
├── .env.example
├── .gitignore
└── package.json
```

---

## Scripts

| Script | Description |
|---|---|
| `npm start` | Start server in production mode |
| `npm run dev` | Start server with nodemon (auto-reload) |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |
