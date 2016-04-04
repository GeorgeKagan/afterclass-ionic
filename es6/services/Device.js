angular.module('afterclass.services').factory('Device', ($rootScope, $ionicPlatform, $ionicHistory, $cordovaToast, $timeout) => {
    'use strict';
    
    let Device = {};

    Device.confirmOnExitApp = () => {
        $ionicPlatform.registerBackButtonAction(e => {
            if ($rootScope.backButtonPressedOnceToExit) {
                ionic.Platform.exitApp();
            }
            else if ($ionicHistory.backView()) {
                $ionicHistory.goBack();
            }
            else {
                $rootScope.backButtonPressedOnceToExit = true;
                $cordovaToast.showShortCenter("Press back button again to exit", a => {}, b => {});
                $timeout(() => $rootScope.backButtonPressedOnceToExit = false, 2000);
            }
            e.preventDefault();
            return false;
        }, 101);
    };

    return Device;
});