# worker-server

The **worker-server** is a lightweight Node.js service that publishes a `{ trigger: "update" }` message to a **NATS** subject (`crypto.update`) every **15 minutes**.

The **api-server** subscribes to that subject and responds by fetching fresh cryptocurrency data from CoinGecko and storing it in MongoDB.

---

## Prerequisites

| Dependency | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| NATS server | 2.x (see root `docker-compose.yml`) |

---

## Setup

### 1. Install dependencies

```bash
cd worker-server
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
NATS_URL=nats://localhost:4222
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

## How It Works

```
[node-cron: */15 * * * *]
        │
        ▼
publishTrigger()
        │
        ▼
NATS publish → subject: "crypto.update"
        │
        ▼   (received by api-server subscriber)
storeCryptoStats()  →  MongoDB
```

1. On startup, the server connects to NATS.
2. A `node-cron` job is scheduled with the expression `*/15 * * * *` — this fires at `:00`, `:15`, `:30`, and `:45` of every hour.
3. On each tick, it publishes `{ "trigger": "update" }` as a JSON string to the `crypto.update` NATS subject.
4. The `api-server`, which subscribes to that subject, receives the message and calls `storeCryptoStats()`.

---

## Project Structure

```
worker-server/
├── src/
│   ├── config/
│   │   └── nats.js        # NATS connection & publishTrigger()
│   ├── jobs/
│   │   └── triggerJob.js  # node-cron schedule
│   └── index.js           # Entry point
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
