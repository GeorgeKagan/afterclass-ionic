angular.module('afterclass.controllers').controller('LoginCtrl', function ($scope, $state, $ionicLoading, $ionicHistory, MyFirebase, User) {
    'use strict';
    var ref = MyFirebase.getRef(), authData;

    $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
    authData = ref.getAuth();

    // Check if got active session
    if (authData) {
        User.getFromUsersCollection().then(function (user) {
            postLoginOps(user, authData);
            doRedirect(user);
        });
    } else {
        $ionicLoading.hide();
    }

    $scope.login = function () {
        window.facebookConnectPlugin.login(['public_profile', 'email'], function(status) {
            $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
            window.facebookConnectPlugin.getAccessToken(function(token) {
                // Authenticate with Facebook using an existing OAuth 2.0 access token
                ref.authWithOAuthToken('facebook', token, function(error, authData) {
                    if (error) {
                        console.log('Firebase login failed!', error);
                    } else {
                        User.saveToUsersCollection(authData).then(function (user) {
                            postLoginOps(user, authData);
                            doRedirect(user);
                        });
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

    var postLoginOps = function (user, authData) {
        User.fillMandatoryFields(user, authData);
    };

    var doRedirect = function (user) {
        if (user.is_choose_type_finished) {
            $state.go('home').then(function() {
                $ionicLoading.hide();
            });
        } else {
            $state.go('userDetails_chooseType').then(function() {
                $ionicLoading.hide();
            });
        }
        $ionicHistory.nextViewOptions({disableBack: true});
    };
});