import express from 'express'
import cors from 'cors'
import { saveEvent, getCampaigns } from './database.js'

const app = express()
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/events', (req, res) => {
    const { screen_id, campaign_id, timestamp } = req.body;
    const eventId = saveEvent(screen_id, campaign_id, timestamp);

    res.status(201).json({
        succes: true,
        eventId,
        message: "Event saved",
    })
});

app.get('/campaigns', (req, res) => {
    const campaigns = getCampaigns();
    res.json({ campaigns })
});

app.listen(PORT,()=>{
    console.log("runnnig");
});