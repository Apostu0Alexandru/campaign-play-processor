 # Campaign Play Processor

A full-stack system for processing DOOH advertising play events asynchronously. Demonstrates event queuing, background processing, and real-time dashboard updates.

## Overview

Digital billboard screens send play events when ads are displayed. Events are queued in a database, processed asynchronously by a background worker, and aggregated statistics are displayed on a live dashboard that auto-refreshes.

Core flow: POST /events → Queue in database → Worker processes every 5s → GET /campaigns returns updated counts → Frontend auto-refreshes every 3s

## Tech Stack

**Backend:** Node.js, Express, SQLite (better-sqlite3)
**Frontend:** React (Vite)

## Technical Decisions

**Database: better-sqlite3**
Chose better-sqlite3 over sqlite3 or MongoDB for performance and simplicity. Single-file database sufficient for demo scope. Synchronous operations are actually faster than async for this use case since there's no I/O waiting. WAL mode enabled for better concurrency.

**Job Queue: Database-backed with processed flag**
Queue is implemented directly in SQLite rather than in-memory JS array. Events persist across restarts. The `processed` flag acts as queue state: 0 = queued, 1 = completed. Worker queries `WHERE processed = 0` to get pending jobs. Simple, durable, and meets the "store events in database" bonus requirement. Trade-off: slightly slower than in-memory but gains persistence.

**Queue Architecture: Single events table with processed flag**
Simple and effective. Events stored with `processed = 0` (queued) or `processed = 1` (done). Worker polls for unprocessed events. Acts as both transaction log and queue without additional complexity.

The query `getCampaigns()` counts rows where `processed = 1` grouped by campaign_id. Each row = one play event. 5 events = 5 plays = play count of 5. Direct counting works fine at this scale.

**Async Processing: setInterval polling**
Worker runs via `setInterval` every 5 seconds, independent of API requests. Demonstrates async job handling without external dependencies like Redis or Bull. API returns immediately, processing happens later on worker's schedule. Clean separation between request handling and work execution.

**Error Handling Strategy**
Database functions catch errors, log with context, and propagate to callers. Express endpoints have try-catch blocks that return appropriate HTTP status codes (400 for validation, 500 for server errors). Worker uses nested try-catch to handle individual event failures without stopping batch processing. Failed events remain unprocessed and retry on next cycle.

**Why not separate campaigns table initially**
Started simple with one table. GROUP BY query on events table is fast enough for expected scale. Could add denormalized campaigns table for O(1) reads if scaling to millions of events, but unnecessary complexity for this demo challenge. 

**Frontend: React with Vite**
React for component-based architecture and reactive state management. Vite for fast dev setup and hot reloading. All three core requirements in single App.jsx component. Minimalist design inspired by early computing displays and terminal interfaces, using google fonts Space Mono and Press Start 2P.

## Implementation

**Database Schema:**
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  screen_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  processed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**CRUD Operations:**
- `saveEvent()` - Inserts event with processed = 0
- `getCampaigns()` - Counts processed events grouped by campaign
- `getUnprocessedEvents()` - Fetches events where processed = 0
- `markProcessedEvents()` - Sets processed = 1 for specific event

**Backend Endpoints:**
- POST /events - Accepts play event, queues it immediately, returns success
- GET /campaigns - Returns all campaigns with aggregated play counts

**Worker Logic:**
Worker runs every 5 seconds via setInterval. Fetches unprocessed events, iterates through each, marks as processed. Logs activity for visibility. Runs independently from API layer - demonstrates async architecture where work acceptance is decoupled from work execution.

**Frontend Implementation:**
- useState manages campaigns array
- useEffect with empty dependency array runs on mount
- Fetches campaigns immediately for initial display
- setInterval set up in same useEffect to refetch every 3 seconds
- Cleanup function returned from useEffect clears interval on unmount
- Simulate button generates random event (screen_id, campaign_id, timestamp) and POSTs to /events
- Map over campaigns array to render list with keys

Tested end-to-end through React UI. Click simulate → event queued → worker processes within 5s → auto-refresh shows updated count within 3s after processing. Complete async pipeline visible.

## Installation

**Backend:**
```bash
npm install
node server.js
```
Server runs on http://localhost:3000

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Dev server runs on http://localhost:5173

## Testing

1. Start backend server
2. Start frontend dev server
3. Open frontend in browser
4. Click "Press to simulate an event!" button
5. Watch backend logs show event received and queued
6. Within 5s, see worker process event in logs
7. Within 3s after processing, see play count increment on dashboard automatically

## Future Improvements

**With more time:**
- Separate campaigns table for having less play counts reads (O(1) reads vs O(n) counting)
- Add indexes on campaign_id and processed flag for query optimization
- Chart visualization of play counts using Recharts or Chart.js
- WebSocket connection for instant updates instead of polling
- TypeScript for type safety across full stack
- Comprehensive test suite (unit tests for DB operations, integration tests for API, E2E tests)
- Rate limiting on POST /events endpoint
- Docker containerization for consistent deployment
- Deploy backend to Render/Fly.io, frontend to Vercel
- Batch processing limits in worker (max 100 events per cycle) -> here using a production framework such as BullMQ
- Multiple campaign support in simulate button (randomize campaign_id)
- Loading states and error messages in frontend
- Impressions per screen breakdown 
- Toggle to pause/resume worker processing

**Architectural considerations for scale:**
If scaling to millions of events, would implement:
- Campaigns table with play_count column updated by worker
- Partial index on `processed = 0` for faster queue queries
- Worker processes events in batches with transactions
- Multiple worker instances with distributed queue (Redis/SQS)
- Database connection pooling
- Caching layer for campaign reads

## Time Spent

- Database design and backend setup: ~2.5 hours
- Worker implementation and testing: ~1 hour
- Frontend React implementation: ~2.5 hours
- Testing and documentation: ~1.5 hour 

Total: ~7.5 hours