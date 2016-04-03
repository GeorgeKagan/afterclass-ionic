angular.module('afterclass.services').factory('PayPal', ($q, $ionicPlatform, $filter, $timeout) => {
    let q;

    /**
     * Initializes the paypal ui with certain environments.
     * @returns {object} Promise paypal ui init done
     */
    function initPaymentUI() {
        q = $q.defer();
        $ionicPlatform.ready().then(() => {
            let clientIDs = {
                PayPalEnvironmentProduction: 'AUU7N18uMHDSO7h2q9Zo9YydU1R2QD_YK80Liy6pnyioZSHGTUpq4i2fYuL9emdZ9mblcjFRkEE6wbCi',
                PayPalEnvironmentSandbox   : 'AYL2z2pUvjGMhgBqGm3dHMpsLWvNwYnF6lO61xkNZwLuoZVV9JwlL9QzMPMfXDX7NGbnl1pbJ_9rQf6I'
            };
            PayPalMobile.init(clientIDs, onPayPalMobileInit);
        });
        return q.promise;
    }

    /**
     * Creates a paypal payment object
     * @param total
     * @param name
     * @returns {object} PayPalPaymentObject
     */
    function createPayment(total, name) {
        return new PayPalPayment(`${total}`, 'USD', `${name}`, 'Sale', {});
    }

    /**
     * Helper to create a paypal configuration object
     * @returns {object} PayPal configuration
     */
    function configuration() {
        // for more options see `paypal-mobile-js-helper.js`
        return new PayPalConfiguration({
            merchantName            : 'AfterClass',
            merchantPrivacyPolicyURL: 'afterclass.com',
            merchantUserAgreementURL: 'afterclass.com'
        });
    }

    /**
     *
     */
    function onPayPalMobileInit() {
        $ionicPlatform.ready().then(() => {
            // must be called
            // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
            let env_app = localStorage.getItem('env'),
                env = env_app && env_app === 'dev' ? 'PayPalEnvironmentSandbox' : 'PayPalEnvironmentProduction';

            PayPalMobile.prepareToRender(env, configuration(), () => {
                $timeout(() => q.resolve());
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
        let q = $q.defer();

        total = $filter('number')(total, 2);
        $ionicPlatform.ready().then(() => {
            PayPalMobile.renderSinglePaymentUI(createPayment(total, name), result => {
                $timeout(() => q.resolve(result));
            }, error => $timeout(() => q.reject(error)));
        });

        return q.promise;
    }

    return {
        initPaymentUI     : initPaymentUI,
        createPayment     : createPayment,
        configuration     : configuration,
        onPayPalMobileInit: onPayPalMobileInit,
        makePayment       : makePayment
    };
});