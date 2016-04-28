angular.module('afterclass.services').factory('Utils', ($rootScope, $window, $ionicHistory) => {
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

    Utils.myGoBack = () => {
        let wentBack = $ionicHistory.goBack();
        if (!wentBack) {
            $window.history.back()
        }
    };

    Utils.getPopoverHeight = () => {
        let itemCount = angular.element('ion-popover-view .list a').length + 1;
        return `popover-${itemCount}-items`;
    };

    return Utils;
});