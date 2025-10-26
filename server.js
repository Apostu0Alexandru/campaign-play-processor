import express from 'express'
import cors from 'cors'
import { saveEvent, getCampaigns } from './database.js'
import './worker.js'

const app = express()
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/events', (req, res) => {
    try {
        const { screen_id, campaign_id, timestamp } = req.body;

        // error handling
        if (!screen_id || !campaign_id || !timestamp) {
            return res.status(400).json({
                error: "Check the required fields",
                required: ['screen_id', 'campaign_id', 'timestamp']
            });
        }

        // save event
        const eventId = saveEvent(screen_id, campaign_id, timestamp);

        res.status(201).json({
            success: true,
            eventId,
            message: "Event saved",
        })
    } catch (error) {
        console.log("Failed to access the api request", error);
        res.status(500).json({
            error: "Failed saving event",
            message: error.message
        })
    }
});

app.get('/campaigns', (req, res) => {
    try {
        const campaigns = getCampaigns();
        res.json({ campaigns });
    } catch (error) {
        res.status(500).json({
            error: "Failed to get the campaigns info",
            message: error.message
        })
    }
});

app.listen(PORT, () => {
    console.log("runnnig");
});