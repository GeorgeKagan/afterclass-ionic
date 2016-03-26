angular.module('afterclass.services').factory('AppConfig', function ($rootScope, $q, $firebaseObject, $timeout, AmazonSNS, MyFirebase, defaultConfig) {
    'use strict';

    let ref = MyFirebase.getRef();
    let sync = ref.child('config');
    let config = $firebaseObject(sync);

    let combinedConfig = defaultConfig;

    return {
        //promise: config.$loaded,
        loadConfig: function() {
            var q = $q.defer();
            config.$loaded().then(function() {
                combinedConfig = _.assign(defaultConfig, config);
                q.resolve();
            });
            return q.promise;
        },
        getConfig: function() {
            return combinedConfig;
        }
    };

});