// Import express as webserver connection

const express = require('express');
const bodyParser = require('body-parser')

// Import our JSON-RPC bridge helper stuff
const coinRPC = require('./src/coinRPC');
// Import the local config file with our Faucet settings.
const config = require('./config.js');
// Import the util file
const util = require('./src/util');

const Transaction = require('./src/Transaction')
const processTx = require('./src/processTx')

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
	waitingForDeposit: [], // Tracks swaps that are waiting for deposits to be made (waiting for the user to deposit funds)
	depositReceived: [], // Tracks swaps that have received a transaction, but have not yet been sent out yet. This usually will hold transactions waiting on extra confirmations.
	swapSent: [], // Contains swaps that have finished/completed.
	completedBlocksInterval: [] // Contains a list of blocks that have been successfully processed.
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
app.post('/swap', (req, res) => {
	const transaction = new Transaction(req.query, config)
	if (transaction.isValid())
		transaction.make(req.query)
	else
		console.log('can\'t')
})

app.get('/blocknotify', (req, res) => {
	const currency = req.query.currency
	const coin = config.coins[currency]
	const tx = req.query.tx
	console.log(`The block from hash ${tx} just arrive in the blockchain of ${currency}`)
	processTx.getInfo(tx, coin).then((info) => {
		console.log(info)
		res.send(info)	
	})
})

app.listen(config.port, function(){
	console.log("Listening on http://127.0.0.1:" + config.port)
});