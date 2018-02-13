const bitcoin = require('bitcoinjs-lib')
const axios = require('axios');

function isValidAddress (address, network) {
	try {
		let dec = bitcoin.address.fromBase58Check(address)
		return dec.version === network.pubKeyHash || dec.version === network.scriptHash
	} catch (e) {
		return false
	}
}

function getCredentials(coin) {
	return {
		port: coin.rpc.port,
		host: coin.rpc.hostname,
		user: coin.rpc.username,
		pass: coin.rpc.password
	}
}

function getCurrencyValue(currency, onSuccess, onError){
	axios.get(currency.api_endpoint)
	.then(function(res){
		var value = currency.transform_api_data(res.data);

		onSuccess(value);
	}).catch(function(error){
		onError(error);
	})
}

module.exports = {
	isValidAddress,
	getCurrencyValue,
	getCredentials
}