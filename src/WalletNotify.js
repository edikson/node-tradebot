'use strict'

// Import rpc to provide JSON-RPC bridge to Coins
const coinRPC = require('./coinRPC')
const util = require('./util.js');

module.exports =
class WalletNotify {
	constructor(query, config, db, OIPJS) {
		this.coin_ = config.coins[query.coin]
		this.queryCoin_ = query.coin
		this.txid_ = query.txid
		this.config_ = config
		this.db_ = db
		this.OIPJS_ = OIPJS
	}

	processTx(onSuccess, onError) {
		var txSearch = this.db_
			.get('depositReceived')
			.find({ txid: this.txid_ })
			.value()

		if (txSearch) {
			this.attemptSend(this.txid_)
		} else {
			const _this = this;

			coinRPC.getTransaction(this.coin_, this.txid_, function (err, info) {
				if (!err) {
					for (var tx of info.details){
						if (tx.category === "receive"){
							var txSearch = _this.db_
								.get('waitingForDeposit')
								.find({ depositAddress: tx.address })
								.value()

							console.log(txSearch);

							// Tx found!
							if (txSearch !== undefined){
								_this.depositReceived(info, tx, txSearch, _this.coin_)
							}
						}
					}
				}
			})
		}
	}

	// This method is run on the initial tx ingestion.
	depositReceived(txinfo, txdetail, txSearch, coin) {
		var txSearch = this.db_
			.get('waitingForDeposit')
			.find({ depositAddress: txdetail.address })
			.value()

		var depositRecord = {
			txid: txinfo.txid,
			confirmations: txinfo.confirmations,
			info: txinfo,
			detail: txdetail,
			swapRequest: txSearch
		}

		this.db_
			.get('depositReceived')
			.push(depositRecord)
			.write()

		this.attemptSend(txinfo.txid)
	}

	attemptSend(txid){
		var txSearch = this.db_
			.get('depositReceived')
			.find({ txid: txid })
			.value()

		this.canProcessSend(txSearch);
	}

	attemptSendAll(){
		var txSearch = this.db_
			.get('depositReceived')
			.value()

		for (var tx of txSearch){
			this.canProcessSend(tx);
		}
	}

	updateConfirmations(){
		var txSearch = this.db_
			.get('depositReceived')
			.value()

		var _this = this;

		for (var tx of txSearch){
			coinRPC.getTransaction(this.config_.coins[tx.swapRequest.from], tx.info.txid, function(err, info){

				var updateConfirm = _this.db_
					.get('depositReceived')
					.find({txid: info.txid})
					.assign({confirmations: info.confirmations})
					.write()

				var txSearch = _this.db_
					.get('depositReceived')
					.find({txid: info.txid})
					.value()

				_this.canProcessSend(txSearch)
			})
		}
	}

	canProcessSend(tx){
		var coinTo = tx.swapRequest.to
		var coinFrom = this.config_.coins[tx.swapRequest.from].currency_name
		var amount = tx.detail.amount
		var txid = tx.info.txid

		// Check if coinFrom matches the coin that sent the daemon request.
		if (tx.swapRequest.from !== this.queryCoin_)
			return;

		var findSentAlready = this.db_
			.get('swapSent')
			.find({ origTxid: txid })
			.value()

		if (findSentAlready)
			return;

		if (!tx.confirmations){
			tx.confirmations = tx.info.confirmations
		}

		if (tx.confirmations < this.config_.min_confirmations){
			console.log("Checking Zero Conf value...");

			try {

			var minConfFiat = this.config_.zero_confirmation_send.fiat;
			var minConfAmount = this.config_.zero_confirmation_send.amount;

			var _this = this;

			this.OIPJS_.Data.getExchangeRate(coinFrom, minConfFiat, function(FiatToCoin){
				var receivedUSDValue = FiatToCoin * amount;

				console.log("Amount Received " + receivedUSDValue);

				if (parseFloat(receivedUSDValue) <= parseFloat(minConfAmount)){
					console.log("Process Zero Conf")
					_this.processSend(tx)
				} else {
					console.log("Amount Above Zeroconf Amount!")
				}
			}, function(error){
				console.error(error);
			})
			}catch(e){console.error(e)}
		} else if (tx.confirmations >= this.config_.min_confirmations) {
			this.processSend(tx)
		}
	}

	processSend(tx){
		console.log("Process Send");

		var fiat = "usd";

		var coinTo = this.config_.coins[tx.swapRequest.to].currency_name
		var coinConfig = this.config_.coins[tx.swapRequest.to]
		var coinFrom = this.config_.coins[tx.swapRequest.from].currency_name
		var amount = tx.detail.amount
		var receiveAddress = tx.swapRequest.receiveAddress
		var txid = tx.info.txid

		var _this = this;

		this.OIPJS_.Data.getExchangeRate(coinFrom, fiat, function(FiatToCoinFrom){
			var CoinFromFiatValue = FiatToCoinFrom * amount;
			console.log("Coin From Value Fiat: " + CoinFromFiatValue);

			_this.OIPJS_.Data.getExchangeRate(coinTo, fiat, function(FiatToCoinTo){
				var CoinToCoinValue = CoinFromFiatValue / FiatToCoinTo;

				CoinToCoinValue = parseFloat(CoinToCoinValue.toFixed(8));

				console.log("Coin To Value Coin: " + CoinToCoinValue)

				var txSearch = _this.db_
					.get('swapSent')
					.find({ origTxid: txid })
					.value()

				if (!txSearch) {
					console.log("Send " + CoinToCoinValue + " " + coinTo + " to " + receiveAddress + " for " + amount + " " + coinFrom)
					
					coinRPC.sendToAddress(coinConfig, tx.swapRequest.receiveAddress, CoinToCoinValue, function(success){
						_this.db_.get("swapSent").push({
							"timestamp": Date.now(),
							"currency_name": coinTo,
							"address": tx.swapRequest.receiveAddress,
							"amount": CoinToCoinValue,
							"txid": success.txid, 
							"origTxid": txid,
							"status": "sent_successfully"
						}).write();
					}, function(error){
						console.log("Error sending funds via RPC!", error);
					})
				} else {
					console.log("ALREADY SENT!!!");
				}
			}, function(error){
				console.error("Error getting exchange rate");
			})
		}, function(error) {
			console.error("Error getting exchange rate");
		})
	}
}
