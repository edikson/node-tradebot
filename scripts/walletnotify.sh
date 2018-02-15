#!/bin/sh
coin=$1
txid=$2
curl "http://localhost:3846/walletnotify?coin=$coin&txid=$txid"