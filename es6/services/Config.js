angular.module('afterclass.services').factory('AppConfig', ($firebaseObject, MyFirebase, defaultConfig) => {
    'use strict';

    let ref            = MyFirebase.getRef(),
        sync           = ref.child('config'),
        config         = $firebaseObject(sync),
        combinedConfig = defaultConfig;

    return {
        loadConfig: () => config.$loaded().then(() => combinedConfig = _.assign(defaultConfig, config)),
        getConfig: () => combinedConfig
    };
});