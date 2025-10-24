import { getUnproccesedEvents, markProcessedEvents } from "./database.js";

function handleEventProcessing() {
    try {
        const events = getUnproccesedEvents();
        if (events.length === 0){
            console.log("No events to process");
            return;
        }
        console.log(`Found ${events.length} unprocessed events ready for work! `);

        events.forEach(element => {
            markProcessedEvents(element.id);
            console.log(`Processed event ${element.id} for the campaign ${element.campaign_id}`);
        });

        console.log(`Total events: ${events.length}`);

    } catch (error) {
        console.log("erorr: ", error);
    }
}
// setting the worker
// passing as a callback handleEventProcessing
setInterval(handleEventProcessing, 5000);
console.log("Worker started, processing every 5 seconds");


