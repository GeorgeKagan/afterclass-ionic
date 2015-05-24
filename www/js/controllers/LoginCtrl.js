angular.module('afterclass.controllers').controller('LoginCtrl', function ($scope, $rootScope, $state, $ionicLoading, $ionicHistory, $cordovaFacebook, UserCollection) {
    'use strict';
    var ref = new window.Firebase("https://dazzling-heat-8303.firebaseio.com"), authData;

    $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
    authData = ref.getAuth();

    // Check if got active session
    if (authData) {
        $state.go('home');
        $ionicLoading.hide();
        $ionicHistory.nextViewOptions({disableBack: true});
    } else {
        $ionicLoading.hide();
    }

    $scope.login = function () {
        window.facebookConnectPlugin.login(['public_profile'], function(status) {
            $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
            window.facebookConnectPlugin.getAccessToken(function(token) {
                // Authenticate with Facebook using an existing OAuth 2.0 access token
                ref.authWithOAuthToken("facebook", token, function(error, authData) {
                    if (error) {
                        console.log('Firebase login failed!', error);
                    } else {
                        UserCollection.saveToUsersCollection(authData);
                        $state.go('home');
                        $ionicLoading.hide();
                        $ionicHistory.nextViewOptions({disableBack: true});
                        console.log('Authenticated successfully with payload:', authData);
                    }
                });
            }, function(error) {
                console.log('Could not get access token', error);
            });
        }, function(error) {
            console.log('An error occurred logging the user in', error);
        });
    };
});