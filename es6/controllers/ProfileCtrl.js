angular.module('afterclass.controllers').controller('ProfileCtrl', ($rootScope, $scope, $ionicTabsDelegate, $ionicPopup, $translate, $ionicLoading, MyFirebase, User) => {

    var ref = MyFirebase.getRef();

    $ionicTabsDelegate.select(0);
    $scope.account = {oldPassword: '', newPassword: ''};

    // CHANGE PASSWORD

    $scope.canChangePassword = () => $scope.account.oldPassword.trim() && $scope.account.newPassword.trim();

    $scope.changePassword = () => {
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        ref.changePassword({
            email      : $rootScope.user.email,
            oldPassword: $scope.account.oldPassword,
            newPassword: $scope.account.newPassword
        }, function(error) {
            if (error === null) {
                $scope.account.oldPassword = '';
                $scope.account.newPassword = '';
                $ionicPopup.alert({
                    title   : $translate.instant('SUCCESS'),
                    template: $translate.instant('FORM.PW_CHANGED'),
                    okText  : $translate.instant('OK')
                });
                console.log("Password changed successfully");
            } else {
                $ionicPopup.alert({
                    title   : $translate.instant('ERROR'),
                    template: $translate.instant('FORM.BAD_OLD_PW'),
                    okText  : $translate.instant('OK')
                });
                console.log("Error changing password:", error);
            }
            $ionicLoading.hide();
        });
    };

    // SETTINGS

    $scope.languages = [
        {id: 'he', name: 'עברית'},
        {id: 'en', name: 'אנגלית'}
    ];
    $scope.settings = {language: 'he'};

    $scope.saveSettings = () => {
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        User.updateUser({ui_lang: $scope.settings.language}).then(() => $ionicLoading.hide());
    };
});