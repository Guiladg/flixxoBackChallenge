#!/bin/sh

echo "Checking for first run..."

# Checks if a file named CONTAINER_FIRST_STARTUP does not exists
CONTAINER_FIRST_STARTUP="CONTAINER_FIRST_STARTUP"
if [ ! -e /$CONTAINER_FIRST_STARTUP ]; then
   echo "First run detected. Initializing..."
   # Creates the file (after a restart this block will be ommiited)
   touch /$CONTAINER_FIRST_STARTUP
   # Run mock DB data process and then start the app
   echo "Mocking data on DB..."
   npm run mockData:prod
   echo "Runing application..."
   npm run start
else
   # Just start the app
   echo "First run already happened. Restarting..."
   echo "Runing application..."
   npm run start
fi