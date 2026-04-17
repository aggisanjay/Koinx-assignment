# api-server

A Node.js/Express server that fetches cryptocurrency statistics from CoinGecko and stores them in MongoDB. It listens for trigger events via Redis pub/sub and exposes two REST APIs.

---

## Prerequisites

- Node.js v18+
- MongoDB Atlas account → [mongodb.com/atlas](https://mongodb.com/atlas)
- Upstash Redis account → [upstash.com](https://upstash.com)
- CoinGecko API key (free) → [coingecko.com/en/api](https://www.coingecko.com/en/api)

---

## Setup

**1. Install dependencies**
```bash
cd api-server
npm install
```

**2. Configure environment variables**
```bash
cp .env.example .env
```

Open `.env` and fill in your values:
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/koinx
REDIS_URL=rediss://default:<password>@<endpoint>.upstash.io:6379
COINGECKO_API_KEY=your_key_here
PORT=3000
```

**3. Start the server**
```bash
npm run dev      # development (auto-reload)
npm start        # production
```

On startup, the server will:
- Connect to MongoDB
- Connect to Redis and subscribe to the `crypto.update` channel
- Immediately fetch and store crypto stats from CoinGecko

---

## API Reference

### GET `/stats`

Returns the latest price data for a coin.

**Query Parameters**

| Param | Required | Values |
|-------|----------|--------|
| `coin` | ✅ | `bitcoin`, `ethereum`, `matic-network` |

**Example**
```
GET /stats?coin=bitcoin
```

**Response**
```json
{
  "price": 40000,
  "marketCap": 800000000,
  "24hChange": 3.4
}
```

---

### GET `/deviation`

Returns the standard deviation of price across the last 100 stored records.

**Query Parameters**

| Param | Required | Values |
|-------|----------|--------|
| `coin` | ✅ | `bitcoin`, `ethereum`, `matic-network` |

**Example**
```
GET /deviation?coin=bitcoin
```

**Response**
```json
{
  "deviation": 4082.48
}
```

---

### GET `/health`

Returns server status.

```json
{ "status": "ok" }
```

---

## Project Structure

```
api-server/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── nats.js            # Redis pub/sub subscriber
│   ├── controllers/
│   │   └── cryptoController.js
│   ├── models/
│   │   └── CryptoStat.js      # Mongoose schema
│   ├── routes/
│   │   └── crypto.js
│   ├── services/
│   │   └── cryptoService.js   # storeCryptoStats()
│   └── index.js
├── .env.example
└── package.json
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run in production mode |
| `npm run dev` | Run with auto-reload (nodemon) |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
