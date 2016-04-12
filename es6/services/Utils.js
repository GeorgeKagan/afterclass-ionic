angular.module('afterclass.services').factory('Utils', ($rootScope, $http, $log) => {
    'use strict';
    
    let Utils = {};

    Utils.triggerAlgorithm = () => {
        let userId = encodeURI($rootScope.user.$id),
            ts = Math.floor(Date.now() / 1000);
        $http.get(
            `http://afterclass-966.appspot.com/StartAlgorithm?userId=${userId}&timestamp=${ts}`,
            data => $log.info(data)
        );
    };

    return Utils;
});