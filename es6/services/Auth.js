angular.module('afterclass.services').factory('Auth', ($rootScope, $ionicHistory, $ionicPopup, $ionicLoading, $timeout, $translate, $state, $window, $log, MyFirebase, User) => {
    'use strict';
    
    let Auth = {};

    Auth.ref = MyFirebase.getRef();

    Auth.autoLoginIfGotSession = () => {
        let authData = Auth.ref.getAuth();
        if (authData) {
            delete authData.auth.token;
            User.getFromUsersCollection().then(user => {
                Auth.postLoginOps(user, authData);
                Auth.doRedirect(user);
            });
        } else {
            navigator.splashscreen && navigator.splashscreen.hide();
        }
    };

    Auth.loginWithEmail = (account) => {
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        Auth.ref.authWithPassword({
            email   : account.email,
            password: account.password
        }, (error, authData) => {
            if (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title   : $translate.instant('ERROR'),
                    template: $translate.instant('POPUPS.ACC_NOT_FOUND'),
                    okText  : $translate.instant('OK')
                });
                $log.log('Firebase login failed!', error);
            } else {
                User.saveToFirebase(authData).then(function (user) {
                    Auth.postLoginOps(user, authData);
                    $ionicLoading.hide();
                    Auth.doRedirect(user);
                });
                $log.log('Logged in successfully with payload:', authData);
            }
        });
    };

    Auth.loginWithFacebook = () => {
        window.facebookConnectPlugin.login(['public_profile', 'email'], status => {
            $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
            window.facebookConnectPlugin.getAccessToken(token => {
                // Authenticate with Facebook using an existing OAuth 2.0 access token
                Auth.ref.authWithOAuthToken('facebook', token, (error, authData) => {
                    if (error) {
                        $log.log('Firebase login failed!', error);
                    } else {
                        delete authData.auth.token;
                        User.saveToFirebase(authData).then(user => {
                            Auth.postLoginOps(user, authData);
                            Auth.doRedirect(user);
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

    Auth.logout = (popover) => {
        facebookConnectPlugin.logout(angular.noop);
        Auth.ref.unauth();
        $ionicHistory.nextViewOptions({disableBack: true});
        popover.hide();
        $state.go('login').then(() => $window.location.reload(true));
        if (localStorage.getItem('isDevUser') === 'true') {
            localStorage.setItem('isImpersonating', false);
        }
    };

    Auth.sendResetEmail = (account, scope) => {
        if (!account.email) {
            return $ionicPopup.alert({
                title   : $translate.instant('ERROR'),
                template: $translate.instant('POPUPS.INPUT_EMAIL'),
                okText  : $translate.instant('OK')
            });
        }
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        Auth.ref.resetPassword({
            email: account.email
        }, error => {
            if (error === null) {
                account.password = '';
                $ionicPopup.alert({
                    title   : $translate.instant('SUCCESS'),
                    template: $translate.instant('RESET_PW_SENT'),
                    okText  : $translate.instant('OK')
                });
                $log.log('Password reset email sent successfully');
            } else {
                $ionicPopup.alert({
                    title   : $translate.instant('ERROR'),
                    template: $translate.instant('EMAIL_NOT_FOUND'),
                    okText  : $translate.instant('OK')
                });
                $log.log('Error sending password reset email: ', error);
            }
            $ionicLoading.hide();
            scope.$apply();
        });
    };

    Auth.register = (account) => {
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        Auth.ref.createUser({
            email     : account.email,
            password  : account.password
        }, (error, authData) => {
            if (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title   : $translate.instant('ERROR'),
                    template: error,
                    okText  : $translate.instant('OK')
                });
                $log.log('Firebase register failed!', error);
            } else {
                Auth.ref.authWithPassword({
                    email   : account.email,
                    password: account.password
                }, (error, authData) => {
                    authData = angular.extend(authData, {
                        first_name: account.firstName,
                        last_name : account.lastName
                    });
                    User.saveToFirebase(authData).then(function (user) {
                        Auth.postLoginOps(user, authData);
                        $ionicLoading.hide();
                        Auth.doRedirect(user);
                    });
                    $log.log('Registered successfully with payload:', authData);
                });
            }
        });
    };

    Auth.postLoginOps = (user, authData) => User.fillMandatoryFields(user, authData);

    Auth.doRedirect = user => {
        let state = user.is_choose_type_finished ? 'home' : 'userWizard_chooseType';
        $state.go(state).then(() => {
            $ionicLoading.hide();
            $timeout(() => navigator.splashscreen && navigator.splashscreen.hide(), 500);
        });
        $ionicHistory.nextViewOptions({disableBack: true});
    };

    return Auth;
});