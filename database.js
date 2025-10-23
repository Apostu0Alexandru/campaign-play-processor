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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    )
`)

function saveEvent(screenId, campaignId, timestamp) {
    const stmt = db.prepare('INSERT INTO events ( screen_id, campaign_id, timestamp, processed VALUES (?, ?, ?, 0)');
    const result = stmt.run(screenId, campaignId, timestamp);
    return result.lastInsertRowid
}


function getCampaigns() {
    const stmt = db.prepare(`
        SELECT campaign_id, COUNT(*) as play_count
        FROM events 
        WHERE processed = 1
        GROUP BY campaign_id
        ORDER BY play_count`);
    const result = stmt.all();
    return result
}

export {db, saveEvent, getCampaigns}