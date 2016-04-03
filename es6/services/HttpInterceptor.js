angular.module('afterclass.services').factory('HttpInterceptor', () => {
    return {
        request: config => {
            return config;
        },
        response: response => {
            return response;
        }
    };
});