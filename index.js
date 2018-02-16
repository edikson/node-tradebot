// Import express as webserver connection

const express = require('express');
const bodyParser = require('body-parser')

const OIPJS = require('oip-js');

// Import our JSON-RPC bridge helper stuff
const coinRPC = require('./src/coinRPC');
// Import the local config file with our Faucet settings.
const config = require('./config.js');
// Import the util file
const util = require('./src/util');

const SwapRequest = require('./src/SwapRequest')
const WalletNotify = require('./src/WalletNotify')
const BlockNotify = require('./src/BlockNotify')

const MINUTES = 60;
const SECONDS = 60;
const MILISECONDS = 1000;

// Import lowdb for database handling
const low = require('lowdb')
// FileSync will provide us with a way to save our db to a file
const FileSync = require('lowdb/adapters/FileSync')
// Here we setup the db file
const adapter = new FileSync('db.json')
// And again, finishing the db setup
const db = low(adapter);

// Setup database defaults
db.defaults({
	swapRequests: [], // Contains information about the users created swap requests
	depositReceived: [], // Tracks swaps that have received a transaction, but have not yet been sent out yet. This usually will hold transactions waiting on extra confirmations.
	swapSent: [], // Contains swaps that have finished/completed.
	completedBlocksInterval: [], // Contains a list of blocks that have been successfully processed.
	cantSend: [] // Contains information about depositReceived that cannot be processed for some reason. Usually this happens if the amount they sent is too low.
}).write();

// Start up the "app" (webserver)
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Listen to connections on "http://faucet:port/"
// Respond with a status of being online.
app.get('/', (req, res) => {
	res.send(JSON.stringify({
		status: "online"
	}));
})

// Listen to conenctions on "http://faucet:port/faucet"
app.get('/swap', (req, res) => {
	const swap = new SwapRequest(req.query, config, db)
	if (swap.isValid())
		swap.make(function(address){
			res.send(address);
		}, function(error){
			console.log(error);
			res.send("Error getting address.");
		})
	else
		res.send('can\'t')
})

app.get('/status', (req, res) => {
	res.send("Not Yet Implemented.");
})

app.get('/blocknotify', (req, res) => {
	console.log(req.query);

	const block = new BlockNotify(req.query, config, db, OIPJS)

	block.process();

	res.send("success");
})

var processingTxs = [];

app.get('/walletnotify', (req, res) => {
	const incomingTx = new WalletNotify(req.query, config, db, OIPJS)

	if (processingTxs.includes(req.query.txid)){
		setTimeout(incomingTx.processTx, 5000)
	} else {
		processingTxs.push(req.query.txid)
		incomingTx.processTx();
		setTimeout(function(){
			processingTxs.splice(processingTxs.indexOf(req.query.txid), 1)
		}, 4000)
	}

	res.send("success");
})

app.listen(config.port, function(){
	console.log("Listening on http://127.0.0.1:" + config.port)
});