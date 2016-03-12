angular.module('afterclass.controllers').controller('EmailLoginCtrl', function ($scope, $state, $ionicLoading, $ionicHistory, $ionicPopup, $translate, MyFirebase, User) {
    'use strict';
    var ref = MyFirebase.getRef(), authData;

    //todo: export to service
    $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
    authData = ref.getAuth();

    //todo: export to service
    // Check if got active session
    if (authData) {
        User.getFromUsersCollection().then(function (user) {
            postLoginOps(user, authData);
            doRedirect(user);
        });
    } else {
        $ionicLoading.hide();
    }

    $scope.account = {firstName: '', lastName: '', email: '', password: '', passwordAgain: ''};
    $scope.show = 'login';

    $scope.showLogin = ()    => $scope.show = 'login';
    $scope.showRegister = () => $scope.show = 'register';

    $scope.canLogin = () => {
        return $scope.account.email && $scope.account.password;
    };
    $scope.canRegister = () => {
        return $scope.account.firstName && $scope.account.lastName &&
            $scope.account.email && $scope.account.password && $scope.account.passwordAgain && $scope.isPasswordsSame();
    };
    $scope.isPasswordsSame = () => $scope.account.password === $scope.account.passwordAgain;

    $scope.login = () => {
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        ref.authWithPassword({
            email   : $scope.account.email,
            password: $scope.account.password
        }, function (error, authData) {
            if (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title   : 'שגיאה',
                    template: 'לא נמצא חשבון התואם לפרטים שהזנת',
                    okText  : $translate.instant('OK')
                });
                console.log('Firebase login failed!', error);
            } else {
                User.saveToUsersCollection(authData).then(function (user) {
                    postLoginOps(user, authData);
                    $ionicLoading.hide();
                    doRedirect(user);
                });
                console.log('Logged in successfully with payload:', authData);
            }
        });
    };

    $scope.register = () => {
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        ref.createUser({
            email     : $scope.account.email,
            password  : $scope.account.password
        }, function(error, authData) {
            if (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title   : 'שגיאה',
                    template: error,
                    okText  : $translate.instant('OK')
                });
                console.log('Firebase register failed!', error);
            } else {
                ref.authWithPassword({
                    email   : $scope.account.email,
                    password: $scope.account.password
                }, function (error, authData) {
                    authData = angular.extend(authData, {
                        first_name: $scope.account.firstName,
                        last_name : $scope.account.lastName
                    });
                    User.saveToUsersCollection(authData).then(function (user) {
                        postLoginOps(user, authData);
                        $ionicLoading.hide();
                        doRedirect(user);
                    });
                    console.log('Registered successfully with payload:', authData);
                });
            }
        });
    };

    //todo: export to service
    var postLoginOps = function (user, authData) {
        User.fillMandatoryFields(user, authData);
    };

    //todo: export to service
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