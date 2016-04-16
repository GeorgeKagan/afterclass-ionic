angular.module('afterclass.services').factory('Social', () => {
    'use strict';
    
    let Social = {};

    Social.openFacebookAppPage = () => {
        let packageName = ionic.Platform.isIOS() ? 'fb://' : 'com.facebook.katana';
        appAvailability.check(packageName,
            () => window.open('fb://page/853342091379410', '_system', 'location=no'),
            () => window.open('http://www.facebook.com/AppAfterClass', '_system', 'location=no'));
    };

    return Social;
});