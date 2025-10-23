# Campaign Play Processor

# Tech stack
  I chose better-sqlite3 instead of sqlite3 or other server databases like mongodb
  for performance. The demo it is not complex, so a database which runs just one a file
  will be a good pick.
  Also here i am not required to use a db.


# Implemented
   events table
   basic crud operations
   For the db i use the events table to store play events using the processed flag. 