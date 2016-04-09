angular.module('afterclass.services').factory('Utils', ($rootScope, $http) => {
    'use strict';
    
    let Utils = {};

    Utils.triggerAlgorithm = () => {
        let userId = encodeURI($rootScope.user.$id),
            ts = Math.floor(Date.now() / 1000);
        $http.get(
            `http://afterclass-966.appspot.com/StartAlgorithm?userId=${userId}&timestamp=${ts}`,
            data => console.info(data)
        );
    };

    return Utils;
});