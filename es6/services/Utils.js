/**
 * Push notifications
 */
angular.module('afterclass.services').factory('Utils', $http => {
    'use strict';
    let Utils = {
        /**
         * Run sync + algorithm
         */
        triggerServerSync() {
            $http.get(
                'http://dashboard.afterclass.co.il/run_sync_and_algorithm.php?hash=FHRH$e509ru28340sdfc2$',
                data => console.info(data)
            );
        }
    };
    return Utils;
});