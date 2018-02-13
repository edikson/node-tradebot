'use strict'

const utils = require('./util')
const coinRPC = require('./coinRPC')

module.exports =
class Transation {
    constructor(query, config, db, table) {
        this.from_ = query.from
        this.to_ = query.to
        this.receiveAddress_ = query.receiveAddress
        this.config_ = config
        this.db_ = db
        this.table_ = table
    }

    isValid() {
        const isAllowedTransaction = this.config_.allowedTransactions[this.from_].indexOf(this.to_) !== -1
        const isValidAddress = utils.isValidAddress(this.receiveAddress_, this.config_.coins[this.to_].network)
        return isAllowedTransaction && isValidAddress
    }

    getDepositaddress_() {
        const coin = this.config_.coins[this.from_]
        return coinRPC.generateDepositAddress(coin)
    }

    createSwapRequest() {
        return this.getDepositaddress_().then((depositAddress) => {
            const time = Date.now()
            const swapRecord = {	
                started_at: time,
                last_connection: time,
                from: this.from_,
                to: this.to_,
                recieveAddress: this.receiveAddress_, // This is the User Supplied address they want to receive the coins at
                depositAddress: depositAddress, // This is the Tradebot generated address where we want the user to deposit their coins to
                status: {
                    type: "WAITING_FOR_DEPOSIT"
                }
            }
            this.db_.get(this.table_).push(swapRecord).write()
            return {
                "success": true,
                "info": depositAddress
            }
        }).catch((err) => {
            return {
                "sucess": false,
                "info": err
            }
        })
    }
}
