var passwords = require("./passwords.json");
let allowed = require('./allowed.json')

module.exports = {
	"port": 3846,
	"recaptcha2": {
		"site_key": passwords.recaptcha2.site_key,
		"secret_key": passwords.recaptcha2.secret_key
	},
	"allowedTransactions": allowed.allowedTransactions,
	"coins": {
		"FLO": {
			"currency_name": "florincoin",
			"send_min": 0.001,
			"rpc": {
				"hostname": "localhost",
				"port": "7313",
				"username": passwords.coins.florincoin.rpc.username,
				"password": passwords.coins.florincoin.rpc.password
			},
			"currency_endpoints": {
				"usd": {
					"currency_code": "USD",
					"api_endpoint": "https://api.coinmarketcap.com/v1/ticker/florincoin/",
					"transform_api_data": function(api_data){
						if (api_data && api_data[0] && api_data[0].price_usd){
							return parseFloat(api_data[0].price_usd);
						} else {
							return -1;
						}
					}
				}
			},
			"network": {
				"pubKeyHash": 35,
				"scriptHash": 8
			}
		},
		"LTC": {
			"currency_name": "litecoin",
			"send_min": 0.001,
			"rpc": {
				"hostname": "localhost",
				"port": "19332",
				"username": passwords.coins.litecoin.rpc.username,
				"password": passwords.coins.litecoin.rpc.password
			},
			"currency_endpoints": {
				"usd": {
					"currency_code": "USD",
					"api_endpoint": "https://api.coinmarketcap.com/v1/ticker/litecoin/",
					"transform_api_data": function(api_data){
						if (api_data && api_data[0] && api_data[0].price_usd){
							return parseFloat(api_data[0].price_usd);
						} else {
							return -1;
						}
					}
				}
			},
			"network": {
				"pubKeyHash": 48,
				"scriptHash": 50
			}
		},
		"BTC": {
			"currency_name": "bitcoin",
			"send_min": 0.001,
			"rpc": {
				"hostname": "localhost",
				"port": "18334",
				"username": passwords.coins.bitcoin.rpc.username,
				"password": passwords.coins.bitcoin.rpc.password
			},
			"currency_endpoints": {
				"usd": {
					"currency_code": "USD",
					"api_endpoint": "https://api.coinmarketcap.com/v1/ticker/bitcoin/",
					"transform_api_data": function(api_data){
						if (api_data && api_data[0] && api_data[0].price_usd){
							return parseFloat(api_data[0].price_usd);
						} else {
							return -1;
						}
					}
				}
			},
			"network": {
				"pubKeyHash": 0,
				"scriptHash": 5
			}
		}
	},
	"zero_confirmation_send": {
		"fiat": "usd",
		"amount": 0.25
	},
	"min_confirmations": 2
}