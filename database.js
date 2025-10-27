import Database from 'better-sqlite3';
const db = new Database('campaigns.db', { verbose: console.log });
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    screen_id TEXT NOT NULL,
    campaign_id TEXT NOT NULL,
    timestamp DATETIME NOT NULL, 
    processed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Functions that the api s are made with. 
function saveEvent(screenId, campaignId, timestamp) {
    try {
        const stmt = db.prepare(
            'INSERT INTO events ( screen_id, campaign_id, timestamp, processed) VALUES (?, ?, ?, 0)' // parameter binding
        );
        const result = stmt.run(screenId, campaignId, timestamp);
        return result.lastInsertRowid;

    } catch (error) {
        console.error("Failed saving event: ", { screenId, campaignId, timestamp, error: error.message });
        throw error;
    }
}


function getCampaigns() {
    try {
        const stmt = db.prepare(`
        SELECT campaign_id, COUNT(*) as play_count
        FROM events 
        WHERE processed = 1
        GROUP BY campaign_id
        ORDER BY play_count DESC`);
        const result = stmt.all();
        return result;
    } catch (error) {
        console.error("Failed to get campaigns", { error: error.message });
        throw error;
    }

}

// Worker functions - a function to get the events that are not flaged as processed and the other
// to mark them as processed. These functions will be used by the worker.
function getUnproccesedEvents() {
    try {
        const stmt = db.prepare(`
        SELECT *
        FROM events
        WHERE processed = 0`);

        const result = stmt.all();
        return result;
    } catch (error) {
        console.error("Failed to get unprocessed events: ", { error: error.message });
        throw error;
    }
}


function markProcessedEvents(idEvent) {
    try {
        const stmt = db.prepare(`UPDATE events SET processed = 1 WHERE id = ? `); // parameter biding

        const result = stmt.run(idEvent);
        return result;
    } catch (error) {
        console.error("Failed to mark processed events: ", { idEvent, error: error.message });
        throw error;
    }
}

export { db, saveEvent, getCampaigns, getUnproccesedEvents, markProcessedEvents };