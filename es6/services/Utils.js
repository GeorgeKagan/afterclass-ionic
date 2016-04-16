angular.module('afterclass.services').factory('Utils', ($rootScope) => {
    'use strict';
    
    let Utils = {};

    Utils.triggerAlgorithm = () => {
        let userId = encodeURI($rootScope.user.$id),
            ts = Math.floor(Date.now() / 1000);
        angular.element.ajax({
            type: "GET",
            dataType: 'jsonp',
            url: `http://afterclass-966.appspot.com/StartAlgorithm?userId=${userId}&timestamp=${ts}` + ($rootScope.env === 'dev' ? '&dev' : '')
        });
    };

    return Utils;
});