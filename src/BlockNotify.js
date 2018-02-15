'use strict'

// Import rpc to provide JSON-RPC bridge to Coins
const coinRPC = require('./coinRPC')
const util = require('./util.js');
const WalletNotify = require('./WalletNotify')

module.exports =
class BlockNotify {
	constructor(query, config, db, OIPJS) {
		this.coin_ = config.coins[query.coin]
		this.queryCoin_ = query.coin
		this.blockHash_ = query.blockhash
		this.config_ = config
		this.db_ = db
		this.OIPJS_ = OIPJS
	}

	process() {
		const _this = this;

		coinRPC.getBlock(this.coin_, this.blockHash_, function (err, info) {
			if (err) {
				// Error!
			} else {
				for (var tx of info.tx) {
					const blocktx = new WalletNotify({ coin: _this.queryCoin_, txid: tx }, _this.config_, _this.db_, _this.OIPJS_);

					blocktx.processTx()
				}
			}
		})

		const block = new WalletNotify({ coin: this.queryCoin_, txid: "" }, this.config_, this.db_, this.OIPJS_);

		block.updateConfirmations()
	}
}
