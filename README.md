# KoinX – Crypto Stats Backend

A two-server Node.js backend that collects and exposes cryptocurrency statistics using CoinGecko, MongoDB, and Redis pub/sub.

---

## Architecture

```
worker-server  ──── Redis pub/sub ────▶  api-server
(cron: 15 min)     { trigger: update }   (fetches CoinGecko → MongoDB)
                                                │
                                         GET /stats
                                         GET /deviation
```

---

## Servers

| Server | Role |
|--------|------|
| `api-server` | HTTP API + CoinGecko fetch + MongoDB storage |
| `worker-server` | Publishes a Redis event every 15 minutes |

---

## Prerequisites

- Node.js v18+
- [MongoDB Atlas](https://mongodb.com/atlas) – free cluster
- [Upstash Redis](https://upstash.com) – free database
- [CoinGecko API Key](https://www.coingecko.com/en/api) – free demo key

---

## Setup

### 1. api-server

```bash
cd api-server
npm install
cp .env.example .env
```

Fill in `api-server/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/koinx
REDIS_URL=rediss://default:<password>@<endpoint>.upstash.io:6379
COINGECKO_API_KEY=your_key_here
PORT=3000
```

```bash
npm run dev
```

### 2. worker-server

```bash
cd worker-server
npm install
cp .env.example .env
```

Fill in `worker-server/.env`:

```env
REDIS_URL=rediss://default:<password>@<endpoint>.upstash.io:6379
```

> Use the **same** `REDIS_URL` as api-server.

```bash
npm run dev
```

---

## API Reference

### `GET /stats?coin=bitcoin`

Returns the latest stats for a coin.

**Supported coins:** `bitcoin`, `ethereum`, `matic-network`

```json
{
  "price": 40000,
  "marketCap": 800000000,
  "24hChange": 3.4
}
```

---

### `GET /deviation?coin=bitcoin`

Returns the standard deviation of price across the last 100 stored records.

```json
{
  "deviation": 4082.48
}
```

---

### `GET /health`

```json
{ "status": "ok" }
```

---

## Scripts

Run inside each server folder:

| Command | Description |
|---------|-------------|
| `npm start` | Production mode |
| `npm run dev` | Development with auto-reload |
| `npm run lint` | Run ESLint |

---

## Folder Structure

```
KoInex-assignment/
├── api-server/
│   ├── src/
│   │   ├── config/         # DB + Redis connection
│   │   ├── models/         # Mongoose schema
│   │   ├── services/       # storeCryptoStats()
│   │   ├── controllers/    # Route handlers
│   │   ├── routes/         # Express routes
│   │   └── index.js        # Entry point
│   ├── .env.example
│   └── package.json
│
└── worker-server/
    ├── src/
    │   ├── config/         # Redis publisher
    │   ├── jobs/           # node-cron schedule
    │   └── index.js        # Entry point
    ├── .env.example
    └── package.json
```
