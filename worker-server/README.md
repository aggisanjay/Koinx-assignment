# worker-server

A lightweight Node.js service that publishes a trigger event to Redis pub/sub every **15 minutes**. The `api-server` listens for this event and fetches fresh cryptocurrency data from CoinGecko.

---

## Prerequisites

- Node.js v18+
- Upstash Redis account → [upstash.com](https://upstash.com)

---

## Setup

**1. Install dependencies**
```bash
cd worker-server
npm install
```

**2. Configure environment variables**
```bash
cp .env.example .env
```

Open `.env` and fill in your value:
```env
REDIS_URL=rediss://default:<password>@<endpoint>.upstash.io:6379
```

> Use the same `REDIS_URL` as in `api-server/.env`.

**3. Start the server**
```bash
npm run dev      # development (auto-reload)
npm start        # production
```

---

## How It Works

```
Every 15 minutes
      │
      ▼
 node-cron fires
      │
      ▼
Redis PUBLISH → channel: "crypto.update"
      │
      ▼  (received by api-server)
storeCryptoStats() → MongoDB
```

1. On startup, the server connects to Redis.
2. A `node-cron` job runs on the schedule `*/15 * * * *` (at `:00`, `:15`, `:30`, `:45` every hour).
3. On each tick, it publishes `{ "trigger": "update" }` to the `crypto.update` Redis channel.
4. The `api-server`, which subscribes to that channel, receives the message and calls `storeCryptoStats()`.

---

## Project Structure

```
worker-server/
├── src/
│   ├── config/
│   │   └── nats.js        # Redis pub/sub publisher
│   ├── jobs/
│   │   └── triggerJob.js  # node-cron schedule
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
