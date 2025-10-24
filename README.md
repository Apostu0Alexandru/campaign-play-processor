# Campaign Play Processor

# Tech stack
  I chose better-sqlite3 instead of sqlite3 or other server databases like mongodb
  for performance. The demo it is not complex, so a database which runs just one a file
  will be a good pick.
  Also here i am not required to use a db.

  I chose express as backend service for clarity and learning curve achieved.

# Implemented
   events table
   basic crud operations
   For the db i use the events table to store play counts using the processed flag. 


   I created the express server with the 2 endpoints from the 2 crud operations: saveEvents, getCampaigns.
   I tested using postman and introduced 4 events. 

   So to get how many plays the campaign has, i count each row as play count. 5 events -> 5 times played -> that is the purpose of the query getCampaigns. 


   Now i have to think about the worker job. 
   Basically the whole async processing logic is about the endpoint post sending requests, the events saved in the database and just accumulate there, waiting for the worker. The worker will run async and will process each event from the queue. The worker has nothing to do with the api calls, so that s why it will run independetely. 
   So the background process is done by this worker so it will be by default async arhitecture.

   I did the other 2 db functions that the worker will use. - getUnproccesedEvents, markProcessedEvents
   Now im coding the worker -- > setInterval()

   First the worker ask the db for unprocessed events -> getUnprocessedEvents() -> check for empty arrays here 
   -> iterate throughout each event to process it -> markProcessedEvents()

   I did the worker logic now, and tested it with postman. Added usefull logs. Backend functional but requires some error handling.