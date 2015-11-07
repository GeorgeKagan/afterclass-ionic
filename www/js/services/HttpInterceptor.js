angular.module('afterclass.services').factory('HttpInterceptor', function($cordovaNetwork) {
    return {
        request: function(config) {
            if (window.cordova && !$cordovaNetwork.isOnline()) {
                alert('Please check that you are connected to the internet');
                return false;
            }
            return config;
        },
        response: function(response) {
            return response;
        }
    };
});