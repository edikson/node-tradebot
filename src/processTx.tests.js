'use strict'

const expect = require('chai').expect

const processTx = require('./processTx')

const config = require('../config.js')

describe('processTx', function() {
    it('should generate address for the right coin', function() {
        const coinCode = 'FLO'
        const blockHash = '77fb63d824abb4f6f91ba73f99eed00faad479c3f95ab71f572fa30410f3c05b'
        return processTx.getInfo(blockHash, config.coins[coinCode]).then((info) => {
            console.log(info)
        })
    })
})