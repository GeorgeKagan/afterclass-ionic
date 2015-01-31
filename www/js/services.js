angular.module('afterclass.services', [])

    .factory('exampleService', function() {
        return 'lol';
    })
    .factory('MyCamera', ['$q', function($q) {
        return {
            getPicture: function(options) {
                var q = $q.defer();
                navigator.camera.getPicture(function(result) {
                    // Do any magic you need
                    q.resolve(result);
                }, function(err) {
                    q.reject(err);
                }, options);
                return q.promise;
            }
        }
    }])
;