#!/bin/sh
coin=$1
blockhash=$2
curl "http://localhost:3846/blocknotify?coin=$coin&blockhash=$blockhash"