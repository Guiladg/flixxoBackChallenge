#!/bin/sh

# Checks if a file named CONTAINER_FIRST_STARTUP does not exists
CONTAINER_FIRST_STARTUP="CONTAINER_FIRST_STARTUP"
if [ ! -e /$CONTAINER_FIRST_STARTUP ]; then
   # Creates the file (after a restart this block will be ommiited)
   touch /$CONTAINER_FIRST_STARTUP
   # Run mock DB data process and then start the app
   npm run mockData:prod && npm run start
else
   # Just start the app
   npm run start
fi