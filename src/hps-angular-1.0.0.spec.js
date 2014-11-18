/**
 * Description: Jasmine unit tests on card tokenization client for Heartland Payment Systems API
 * Version: 1.0.0
 * Author: Herman Kan
 */
describe('hps service', function() {
	var hps, httpReal;
	var publicKey = 'public key here'; //change this to your public key

	beforeEach(module('hps', 'httpReal'));

	beforeEach(inject(function( _hps_, _httpReal_ ) {
		hps = _hps_;
		httpReal = _httpReal_;
	}));

	describe('when checking a card number', function() {
		it('should return VISA type', function() {
			var type = hps.getCardType('4012002000060016');
			expect(type).toBe(hps.cardTypes.VISA);
		});

		it('should return MasterCard type', function() {
			var type = hps.getCardType('5473500000000014');
			expect(type).toBe(hps.cardTypes.MASTER_CARD);
		});

		it('should return Discover type', function() {
			var type = hps.getCardType('6011000990156527');
			expect(type).toBe(hps.cardTypes.DISCOVER);
		});

		it('should return AmEx type', function() {
			var type = hps.getCardType('372700699251018');
			expect(type).toBe(hps.cardTypes.AMERICAN_EXPRESS);
		});

		it('should return JCB type', function() {
			var type = hps.getCardType('3566007770007321');
			expect(type).toBe(hps.cardTypes.JCB);
		});
	});

	describe('when tokenizing a card', function() {
		var futureYear = new Date().getFullYear() + 1;
		var handlers;

		function delayedDone(done) {
			window.setTimeout(done, 0);
		}

		beforeEach(function() {
			handlers = {
				onSuccess: function(token) {
					expect(token.value).toBeDefined();
					expect(token.type).toBeDefined();
					expect(token.expiration).toBeDefined();
				},
				onError: function(error) {
					expect(error.httpStatus).toBeDefined();
					expect(error.message).toBeDefined();
				}
			};

			spyOn(handlers, 'onSuccess').and.callThrough();
			spyOn(handlers, 'onError').and.callThrough();
		});

		it('with valid data should return a valid token', function(done) {
			hps.tokenizeCard(publicKey, '4242424242424242', '123', 12, futureYear)
				.then(handlers.onSuccess, handlers.onError)
				.finally(function() {
					 expect(handlers.onSuccess).toHaveBeenCalled();
					 delayedDone(done);
				});

			httpReal.submit();
		});

		it('with invalid number should return an error', function(done) {
			hps.tokenizeCard(publicKey, '0', '123', 12, futureYear)
				.then(handlers.onSuccess, handlers.onError)
				.finally(function() {
					expect(handlers.onError).toHaveBeenCalledWith({
							httpStatus: 200,
							message: 'Card number is invalid.',
							field: 'card.number',
							code: '2'
						});

					 delayedDone(done);
				});

			httpReal.submit();
		});

		it('with invalid exp month (low) should return an error', function(done) {
			hps.tokenizeCard(publicKey, '4242424242424242', '123', 0, futureYear)
				.then(handlers.onSuccess, handlers.onError)
				.finally(function() {
					expect(handlers.onError).toHaveBeenCalledWith({
							httpStatus: 200,
							message: 'Card expiration month is invalid.',
							field: 'card.exp_month',
							code: '2'
						});

					 delayedDone(done);
				});

			httpReal.submit();
		});

		it('with invalid exp month (high) should return an error', function(done) {
			hps.tokenizeCard(publicKey, '4242424242424242', '123', 13, futureYear)
				.then(handlers.onSuccess, handlers.onError)
				.finally(function() {
					expect(handlers.onError).toHaveBeenCalledWith({
							httpStatus: 200,
							message: 'Card expiration month is invalid.',
							field: 'card.exp_month',
							code: '2'
						});

					 delayedDone(done);
				});

			httpReal.submit();
		});

		it('with invalid exp year (under 2000) should return an error', function(done) {
			hps.tokenizeCard(publicKey, '4242424242424242', '123', 12, 1999)
				.then(handlers.onSuccess, handlers.onError)
				.finally(function() {
					expect(handlers.onError).toHaveBeenCalledWith({
							httpStatus: 200,
							message: 'Card expiration year is invalid.',
							field: 'card.exp_year',
							code: '2'
						});

					 delayedDone(done);
				});

			httpReal.submit();
		});
	});
});
