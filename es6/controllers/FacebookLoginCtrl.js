angular.module('afterclass.controllers').controller('FacebookLoginCtrl', ($scope, $state, $ionicLoading, $ionicHistory, $log, MyFirebase, User) => {
    'use strict';

    if (!localStorage.getItem('finished_on_boarding') && angular.element.inArray('browser', ionic.Platform.platforms) === -1) {
        $ionicHistory.nextViewOptions({disableBack: true});
        $state.go('onBoarding');
        return;
    }

    $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
    $scope.sessionChecked = false;

    let ref = MyFirebase.getRef(), authData;
    authData = ref.getAuth();

    // Check if got active session
    if (authData) {
        User.getFromUsersCollection().then(user => {
            postLoginOps(user, authData);
            doRedirect(user);
        });
    } else {
        $ionicLoading.hide();
        $scope.sessionChecked = true;
    }

    $scope.loginWithFacebook = () => {
        window.facebookConnectPlugin.login(['public_profile', 'email'], status => {
            $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
            window.facebookConnectPlugin.getAccessToken(token => {
                // Authenticate with Facebook using an existing OAuth 2.0 access token
                ref.authWithOAuthToken('facebook', token, (error, authData) => {
                    if (error) {
                        $log.log('Firebase login failed!', error);
                    } else {
                        User.saveToUsersCollection(authData).then(user => {
                            postLoginOps(user, authData);
                            doRedirect(user);
                        });
                        $log.log('Authenticated successfully with payload:', authData);
                    }
                });
            }, error => {
                $log.log('Could not get access token', error);
            });
        }, error => {
            $log.log('An error occurred logging the user in', error);
        });
    };

    $scope.goToLoginWithEmail = () => $state.go('registerOrLogin');

    let postLoginOps = (user, authData) => User.fillMandatoryFields(user, authData);

    let doRedirect = user => {
        if (user.is_choose_type_finished) {
            $state.go('home').then(() => $ionicLoading.hide());
        } else {
            $state.go('userDetails_chooseType').then(() => $ionicLoading.hide());
        }
        $ionicHistory.nextViewOptions({disableBack: true});
    };
});