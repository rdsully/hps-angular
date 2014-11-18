/**
 * Description: AngularJS implementation of card tokenization client for Heartland Payment Systems API
 * Version: 1.0.0
 * Author: Herman Kan
 * License: MIT
 */
(function() {
	'use strict';

	angular
		.module('hps', [])
		.service('hps', hps);

	hps.$inject = ['$http', '$q'];

	function hps($http, $q) {
		this.tokenizeCard = function(publicKey, number, cvc, expMonth, expYear) {
			var deferred = $q.defer();

			var request = {
				url: getGatewayUrl(publicKey) + '/api/token',
				method: 'JSONP',
                cache: false,
				params: {
					'api_key': publicKey,
					'object': 'token',
					'token_type': 'supt',
					'_method': 'post',
					'card[number]': number,
					'card[cvc]': cvc,
					'card[exp_month]': expMonth,
					'card[exp_year]': expYear,
					'callback': 'JSON_CALLBACK'
				}
			};

			$http(request)
				.success(function(data, status, headers, config, statusText) {
                    if (typeof data.error === 'object') {
						deferred.reject({
							httpStatus: status,
							message: data.error.message,
							field: data.error.param,
							code: data.error.code
						});
					} else {
						deferred.resolve({
							value: data.token_value,
							type: data.token_type,
							expiration: new Date(data.token_expire)
						});
					}
				})
				.error(function(data, status, headers, config, statusText) {
					deferred.reject({
						httpStatus: status,
						message: statusText
					});
				});

			return deferred.promise;
		};

		this.cardTypes = {
			VISA:				0,
			MASTER_CARD:		1,
			DISCOVER:			2,
			AMERICAN_EXPRESS:	3,
			DINERS:				4,
			JCB:				5
		};

		this.getCardType = function(number) {
			for (var i = 0; i < reCardNumbers.length; ++i) {
				if (reCardNumbers[i].test(number))
					return i;
			}
			return undefined;
		};

		var reCardNumbers = [];
		reCardNumbers[this.cardTypes.VISA] = /^4[0-9]{12}(?:[0-9]{3})?$/;
		reCardNumbers[this.cardTypes.MASTER_CARD] = /^5[1-5][0-9]{14}$/;
		reCardNumbers[this.cardTypes.DISCOVER] = /^6(?:011|5[0-9]{2})[0-9]{12}$/;
		reCardNumbers[this.cardTypes.AMERICAN_EXPRESS] = /^3[47][0-9]{13}$/;
		reCardNumbers[this.cardTypes.DINERS] = /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/;
		reCardNumbers[this.cardTypes.JCB] = /^(?:2131|1800|35\d{3})\d{11}$/;

		function getGatewayUrl(publicKey) {
			if (publicKey.split('_')[1] === 'cert')
				return 'https://posgateway.cert.secureexchange.net/Hps.Exchange.PosGateway.Hpf.v1';

			return 'https://api.heartlandportico.com/SecureSubmit.v1';
		}
	}
})();
