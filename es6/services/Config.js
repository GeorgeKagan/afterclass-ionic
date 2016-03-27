angular.module('afterclass.services').factory('AppConfig', function ($rootScope, $firebaseObject, $timeout, AmazonSNS, MyFirebase, defaultConfig) {
    'use strict';

    let ref = MyFirebase.getRef();
    let sync = ref.child('config');
    let config = $firebaseObject(sync);

    let combinedConfig = defaultConfig;

    return {
        //promise: config.$loaded,
        loadConfig: function() {
            return config.$loaded().then(function() {
                combinedConfig = _.assign(defaultConfig, config);
            });
        },
        getConfig: function() {
            return combinedConfig;
        }
    };

});