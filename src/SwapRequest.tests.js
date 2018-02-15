'use strict'

const expect = require('chai').expect

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const Transaction = require('./Transaction')
const config = require('../config.js')

describe('Transactions', function() {
    describe('isValid', function() {
        it('should be valid if declared in config', function() {
            const query = {
                from: 'FLO',
                to: 'LTC',
                receiveAddress: 'Lc3Eut7VBnritaGboXUNrTVjhFgRXVFrGs'
            }
            const trans = new Transaction(query, config)
            expect(trans.isValid()).true
        })
        it('should be invalid if not declared in config', function() {
            const query = {
                from: 'BTC',
                to: 'LTC',
                receiveAddress: 'Lc3Eut7VBnritaGboXUNrTVjhFgRXVFrGs'
            }
            const trans = new Transaction(query, config)
            expect(trans.isValid()).false
        })
        it('should be invalid if declared in config but with invalid address', function() {
            const query = {
                from: 'FLO',
                to: 'LTC',
                receiveAddress: 'alexandria'
            }
            const trans = new Transaction(query, config)
            expect(trans.isValid()).false
        })
    })
    describe('createSwapRequest', function() {
        it('should work to get FLO address', function() {
            const adapter = new FileSync('db.test.json')
            const db = low(adapter);
            const table = 'waitingForDeposit' 
            db.defaults({
                waitingForDeposit: []
            }).write()
            const query = {
                from: 'FLO',
                to: 'LTC',
                receiveAddress: 'Lc3Eut7VBnritaGboXUNrTVjhFgRXVFrGs'
            }
            const trans = new Transaction(query, config, db, table)
            return trans.createSwapRequest().then((res) => {
                const justIn = db.get(table).filter({depositAddress: res.info}).value()
                expect(justIn[0].depositAddress).eql(res.info)
            })
        })
        it('should work to get BTC address', function() {
            const adapter = new FileSync('db.test.json')
            const db = low(adapter);
            const table = 'waitingForDeposit' 
            db.defaults({
                waitingForDeposit: []
            }).write()
            const query = {
                from: 'BTC',
                to: 'FLO',
                receiveAddress: 'FHhLNrZtQpXHvTikv3NpmAsBDEqce7tSjc'
            }
            const trans = new Transaction(query, config, db, table)
            return trans.createSwapRequest().then((res) => {
                const justIn = db.get(table).filter({depositAddress: res.info}).value()
                expect(justIn[0].depositAddress).eql(res.info)
            })
        })
        it('should work to get LTC address', function() {
            const adapter = new FileSync('db.test.json')
            const db = low(adapter);
            const table = 'waitingForDeposit' 
            db.defaults({
                waitingForDeposit: []
            }).write()
            const query = {
                from: 'LTC',
                to: 'FLO',
                receiveAddress: 'FHhLNrZtQpXHvTikv3NpmAsBDEqce7tSjc'
            }
            const trans = new Transaction(query, config, db, table)
            return trans.createSwapRequest().then((res) => {
                const justIn = db.get(table).filter({depositAddress: res.info}).value()
                expect(justIn[0].depositAddress).eql(res.info)
            })
        })
    })
})