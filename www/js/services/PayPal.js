/**
 * Payments for teachers
 */
angular.module('afterclass.services')
    .factory('PaypalService', ['$q', '$ionicPlatform', '$filter', '$timeout', function ($q, $ionicPlatform, $filter, $timeout) {
        var init_defer;
        /**
         * Service object
         * @type object
         */
        var service = {
            initPaymentUI: initPaymentUI,
            createPayment: createPayment,
            configuration: configuration,
            onPayPalMobileInit: onPayPalMobileInit,
            makePayment: makePayment
        };

        /**
         * @ngdoc method
         * @name initPaymentUI
         * @methodOf app.PaypalService
         * @description
         * Inits the payapl ui with certain envs.
         *
         *
         * @returns {object} Promise paypal ui init done
         */
        function initPaymentUI() {
            init_defer = $q.defer();
            $ionicPlatform.ready().then(function () {
                var clientIDs = {
                    "PayPalEnvironmentProduction": 'AVm5UxqpOWQxtrw419PmOjt12UHn8quTXJR9S8utqNGaqxhYFi3fzZ6ywQ_tVbgyUQwxl4JpvVC5Mnmg',
                    "PayPalEnvironmentSandbox": 'AX24RtzGMSk3pDev2U2Rq6pbwtYMfj2PKLWwouVwmfMQY9Y3vI88qTrRYPep94bCEHyBvg8pJjj9ecnm'
                };
                PayPalMobile.init(clientIDs, onPayPalMobileInit);
            });
            return init_defer.promise;
        }

        /**
         * @ngdoc method
         * @name createPayment
         * @methodOf app.PaypalService
         * @param {string|number} total total sum. Pattern 12.23
         * @param {string} name name of the item in paypal
         * @description
         * Creates a paypal payment object
         *
         *
         * @returns {object} PayPalPaymentObject
         */
        function createPayment(total, name) {
            return new PayPalPayment("" + total, "USD", "" + name, "Sale", {});
        }

        /**
         * @ngdoc method
         * @name configuration
         * @methodOf app.PaypalService
         * @description
         * Helper to create a paypal configuration object
         *
         *
         * @returns {object} PayPal configuration
         */
        function configuration() {
            // for more options see `paypal-mobile-js-helper.js`
            var config = new PayPalConfiguration({
                merchantName: 'AfterClass',
                merchantPrivacyPolicyURL: 'afterclass.com',
                merchantUserAgreementURL: 'afterclass.com'
            });
            return config;
        }

        function onPayPalMobileInit() {
            $ionicPlatform.ready().then(function () {
                // must be called
                // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
                PayPalMobile.prepareToRender('PayPalEnvironmentSandbox', configuration(), function () {
                    $timeout(function () {
                        init_defer.resolve();
                    });
                });
            });
        }

        /**
         * @ngdoc method
         * @name makePayment
         * @methodOf app.PaypalService
         * @param {string|number} total total sum. Pattern 12.23
         * @param {string} name name of the item in paypal
         * @description
         * Performs a paypal single payment
         *
         *
         * @returns {object} Promise gets resolved on successful payment, rejected on error
         */
        function makePayment(total, name) {
            var defer = $q.defer();
            total = $filter('number')(total, 2);
            $ionicPlatform.ready().then(function () {
                PayPalMobile.renderSinglePaymentUI(createPayment(total, name), function (result) {
                    $timeout(function () {
                        defer.resolve(result);
                    });
                }, function (error) {
                    $timeout(function () {
                        defer.reject(error);
                    });
                });
            });
            return defer.promise;
        }

        return service;
    }]);