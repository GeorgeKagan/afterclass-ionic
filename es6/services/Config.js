angular.module('afterclass.services').factory('AppConfig', ($rootScope, $firebaseObject, MyFirebase, defaultConfig) => {
    'use strict';

    let ref            = MyFirebase.getRef(),
        sync           = ref.child('config'),
        config         = $firebaseObject(sync),
        combinedConfig = defaultConfig;

    // Notify app that the config collection has been changed, so listeners can update the UI
    config.$watch(() => $rootScope.$broadcast('configUpdated'));

    return {
        loadConfig: () => config.$loaded().then(() => combinedConfig = _.assign(defaultConfig, config)),
        getConfig: () => combinedConfig
    };
});