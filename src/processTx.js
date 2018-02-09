'use strict'

// Import rpc to provide JSON-RPC bridge to Coins
const rpc = require('bitcoin');
const util = require('./util.js');

function getInfo(tx, coin) {
    const credentials = util.getCredentials(coin)
	const client = new rpc.Client(credentials);
	return new Promise((resolve, reject) => {
		client.getBlock(tx, (err, info) => {
			if (err)
				reject(err)
			resolve(info)
		})
	})
}

//function tryTxProcess

module.exports = {
    getInfo
}