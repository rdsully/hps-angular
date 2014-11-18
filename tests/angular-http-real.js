/**
 * Description: Helper module to restore ability to send real HTTP requests despite using AngularJS Mocks library
 * Version: 1.0.0
 * Author: Herman Kan
 * License: MIT
 */
(function() {
	'use strict';

	var ORIGINAL_MODULE = 'ng';
	var ORIGINAL_SERVICE = '$httpBackend';

	angular.module('httpReal', [ORIGINAL_MODULE])
		.config(['$provide', function($provide) {
			$provide.decorator(ORIGINAL_SERVICE, function() {
				return angular.injector([ORIGINAL_MODULE]).get(ORIGINAL_SERVICE);
			});
		}])
		.service('httpReal', ['$rootScope', function($rootScope) {
			this.submit = function() {
				$rootScope.$digest();
			};
		}]);
})();
