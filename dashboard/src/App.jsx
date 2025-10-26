import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [campaigns, setCampaigns] = useState([]);

  // fetching the backend endpoint to display the campaigns data and their play count.
  // autorefresing after every 3 seconds.
  useEffect(() => {
    const displayPlayCampaigns = async () => {

      const response = await fetch("http://localhost:3000/campaigns");

      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setCampaigns(data.campaigns);

    }
    displayPlayCampaigns();

    const autoRefreshing = setInterval(displayPlayCampaigns, 3000);

    return () => clearInterval(autoRefreshing);
  }, []);


  // function for simulating an event 
  function playButton() {
    let screen_id = "screen-" + Math.floor(Math.random() * 100);
    let campaign_id = "campaign-33";
    let timestamp = new Date().toISOString();

    let event = {
      screen_id: screen_id,
      campaign_id: campaign_id,
      timestamp: timestamp,
    };

    fetch("http://localhost:3000/events", {
      method: "POST",
      body: JSON.stringify(event),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
      .then((response) => response.json());
  }

  return (
    <div className="screen">
      <h1>CAMPAIGNS</h1>

      <div>
        {campaigns.map((element) => (
          <div key={element.campaign_id} className="campaign-card">
            <span>{element.campaign_id}</span>
            <span className="play-count">{element.play_count}</span>
          </div>
        ))}
      </div>

      <button onClick={playButton} className="simulate-button">
        SIMULATE
      </button>
    </div>
  )
}
