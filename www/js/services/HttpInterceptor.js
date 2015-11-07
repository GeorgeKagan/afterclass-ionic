angular.module('afterclass.services').factory('HttpInterceptor', function() {
    return {
        request: function(config) {
            return config;
        },
        response: function(response) {
            return response;
        }
    };
});