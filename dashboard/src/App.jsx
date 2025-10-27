import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [isPaused, setIsPaused] = useState(true);

  // fetching the backend endpoint to display the campaigns data and their play count.
  // autorefresing after every 3 seconds.
  useEffect(() => {
    const displayPlayCampaigns = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns`);

        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        setCampaigns(data.campaigns);
      } catch (error) {
        console.error(error.message);
      }



    }
    displayPlayCampaigns();

    const autoRefreshing = setInterval(displayPlayCampaigns, 3000);

    return () => clearInterval(autoRefreshing);
  }, []);

  // display the status of the worker: pause or resume.
  useEffect(() => {
    const isWorkPaused = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/worker/status`);

        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        setIsPaused(data.paused);
      } catch (error) {
        console.error(error.message);
      }

    }

    isWorkPaused();
  }, []);

  // function for simulating an event 
  function playButton() {
    let screen_id = "screen-" + Math.floor(Math.random() * 100);
    let campaign_id = campaigns.length > 0 ? campaigns[Math.floor(Math.random() * campaigns.length)].campaign_id : "cmp-2025-33";
    let timestamp = new Date().toISOString();

    let event = {
      screen_id: screen_id,
      campaign_id: campaign_id,
      timestamp: timestamp,
    };
    try {
      fetch(`${import.meta.env.VITE_API_URL}/events`, {
        method: "POST",
        body: JSON.stringify(event),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
        .then((response) => response.json());
    } catch (error) {
      console.error(error.message);
    }

  }

  function workerButton() {
    try {
      if (isPaused) {
        fetch(`${import.meta.env.VITE_API_URL}/worker/resume`, {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        })
          .then(response => response.json()).then(data => setIsPaused(data.paused));
      } else {
        fetch(`${import.meta.env.VITE_API_URL}/worker/pause`, {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        })
          .then(response => response.json()).then(data => setIsPaused(data.paused));
      }
    } catch (error) {
      console.error(error.message);
    }
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
        <span className="worker-pause">{isPaused ? "WORKER: PAUSED" : "WORKER: RUNNING"}</span>
      </div>

      <button onClick={playButton} className="simulate-button">
        SIMULATE
      </button>
      <button onClick={workerButton} className="worker-button">
        {isPaused ? "RESUME" : "PAUSE"}
      </button>
    </div>
  )
}

