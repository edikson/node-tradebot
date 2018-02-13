'use strict'

const expect = require('chai').expect
const coinRPC = require('./coinRPC')
const config = require('../config.js')

describe('coinRPC', function() {
    describe('generateDepositAddress', function() {
        it('should generate address for the right coin', function() {
            const coinCode = 'FLO'
            return coinRPC.generateDepositAddress(config.coins[coinCode]).then((address) => {
                return coinRPC.getListOfAddresses(config.coins[coinCode]).then((addresses) => {
                    const found = addresses.filter((record) => {
                        return record.address === address
                    })
                    expect(found[0].address).eql(address)
                })
            })
        })
    })
})