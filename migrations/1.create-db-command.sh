#!bin/bash

touch  "$(pwd)/dump/videos.db"
node "./migrations/2.create-db.js"
