angular.module('afterclass.controllers').controller('EmailLoginCtrl', ($scope, $state, $ionicLoading, $ionicHistory, $ionicPopup, $translate, $log, MyFirebase, User) => {
    'use strict';
    let ref = MyFirebase.getRef(), authData;

    //todo: export to service
    $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
    authData = ref.getAuth();

    //todo: export to service
    // Check if got active session
    if (authData) {
        User.getFromUsersCollection().then(user => {
            postLoginOps(user, authData);
            doRedirect(user);
        });
    } else {
        $ionicLoading.hide();
    }

    $scope.account = {firstName: '', lastName: '', email: '', password: '', passwordAgain: ''};
    $scope.show = 'login';

    $scope.showLogin    = () => $scope.show = 'login';
    $scope.showRegister = () => $scope.show = 'register';

    $scope.canLogin    = () => $scope.account.email && $scope.account.password;
    $scope.canRegister = () => {
        return $scope.account.firstName && $scope.account.lastName &&
            $scope.account.email && $scope.account.password && $scope.account.passwordAgain && $scope.isPasswordsSame();
    };
    $scope.isPasswordsSame = () => $scope.account.password === $scope.account.passwordAgain;

    /**
     *
     */
    $scope.login = () => {
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        ref.authWithPassword({
            email   : $scope.account.email,
            password: $scope.account.password
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
                User.saveToUsersCollection(authData).then(function (user) {
                    postLoginOps(user, authData);
                    $ionicLoading.hide();
                    doRedirect(user);
                });
                $log.log('Logged in successfully with payload:', authData);
            }
        });
    };

    /**
     *
     * @returns {*}
     */
    $scope.sendResetEmail = () => {
        if (!$scope.account.email) {
            return $ionicPopup.alert({
                title   : $translate.instant('ERROR'),
                template: $translate.instant('POPUPS.INPUT_EMAIL'),
                okText  : $translate.instant('OK')
            });
        }
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        ref.resetPassword({
            email: $scope.account.email
        }, error => {
            if (error === null) {
                $scope.account.password = '';
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
            $scope.$apply();
        });
    };

    /**
     *
     */
    $scope.register = () => {
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        ref.createUser({
            email     : $scope.account.email,
            password  : $scope.account.password
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
                ref.authWithPassword({
                    email   : $scope.account.email,
                    password: $scope.account.password
                }, (error, authData) => {
                    authData = angular.extend(authData, {
                        first_name: $scope.account.firstName,
                        last_name : $scope.account.lastName
                    });
                    User.saveToUsersCollection(authData).then(function (user) {
                        postLoginOps(user, authData);
                        $ionicLoading.hide();
                        doRedirect(user);
                    });
                    $log.log('Registered successfully with payload:', authData);
                });
            }
        });
    };

    //todo: export to service
    let postLoginOps = (user, authData) => User.fillMandatoryFields(user, authData);

    //todo: export to service
    let doRedirect = user => {
        if (user.is_choose_type_finished) {
            $state.go('home').then(() => $ionicLoading.hide());
        } else {
            $state.go('userDetails_chooseType').then(() => $ionicLoading.hide());
        }
        $ionicHistory.nextViewOptions({disableBack: true});
    };
});