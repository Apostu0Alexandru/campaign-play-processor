import { getUnproccesedEvents, markProcessedEvents } from "./database.js";
import { checkPausedWorker } from "./server.js";

function handleEventProcessing() {
    try {
        let isCurrentlyPaused = checkPausedWorker();

        if (isCurrentlyPaused){
            console.log("The worker is currently paused: It is still checking the queue but chosses not to process anything untill resume");
            return;
        }

        const events = getUnproccesedEvents();

        if (events.length === 0) {
            console.log("No events to process");
            return;
        }
        console.log(`Found ${events.length} unprocessed events ready for work! `);

        let succesCount = 0;
        let failedCount = 0;

        events.forEach(element => {
            try {
                markProcessedEvents(element.id);
                console.log(`Processed event ${element.id} for the campaign ${element.campaign_id}`);
                succesCount++;
            } catch (error) {
                console.log("Failed to process the event:", element.campaign_id, " Error:", error);
                failedCount++;
            }
        });

        console.log(`Total events: ${events.length}`);
        console.log(`Succesfull events: ${succesCount}, failed events: ${failedCount}`);

    } catch (error) {
        console.log("erorr: ", error);
    }
}
// setting the worker
// passing as a callback handleEventProcessing
setInterval(handleEventProcessing, 5000);
console.log("Worker started, processing every 5 seconds");


