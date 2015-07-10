/**
 * Payments for teachers
 */
angular.module('afterclass.services')
    .factory('Paypal', ['$q', '$ionicPlatform', '$filter', '$timeout', function ($q, $ionicPlatform, $filter, $timeout) {
        var init_defer;

        /**
         * Initializes the paypal ui with certain environments.
         * @returns {object} Promise paypal ui init done
         */
        function initPaymentUI() {
            init_defer = $q.defer();
            $ionicPlatform.ready().then(function () {
                var clientIDs = {
                    "PayPalEnvironmentProduction": 'AUU7N18uMHDSO7h2q9Zo9YydU1R2QD_YK80Liy6pnyioZSHGTUpq4i2fYuL9emdZ9mblcjFRkEE6wbCi',
                    "PayPalEnvironmentSandbox": 'AYL2z2pUvjGMhgBqGm3dHMpsLWvNwYnF6lO61xkNZwLuoZVV9JwlL9QzMPMfXDX7NGbnl1pbJ_9rQf6I'
                };
                PayPalMobile.init(clientIDs, onPayPalMobileInit);
            });
            return init_defer.promise;
        }

        /**
         * Creates a paypal payment object
         * @param total
         * @param name
         * @returns {object} PayPalPaymentObject
         */
        function createPayment(total, name) {
            return new PayPalPayment("" + total, "USD", "" + name, "Sale", {});
        }

        /**
         * Helper to create a paypal configuration object
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
                //var env = 'PayPalEnvironmentProduction';
                var env = 'PayPalEnvironmentSandbox';
                PayPalMobile.prepareToRender(env, configuration(), function () {
                    $timeout(function () {
                        init_defer.resolve();
                    });
                });
            });
        }

        /**
         * Performs a paypal single payment
         * @param total
         * @param name
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

        return {
            initPaymentUI: initPaymentUI,
            createPayment: createPayment,
            configuration: configuration,
            onPayPalMobileInit: onPayPalMobileInit,
            makePayment: makePayment
        };
    }]);