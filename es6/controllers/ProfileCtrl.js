angular.module('afterclass.controllers').controller('ProfileCtrl', (
    $rootScope, $scope, $ionicTabsDelegate, $ionicPopup, $translate, $ionicLoading, MyFirebase, User, otherUser) => {

    // If viewing someone else and that someone is not the session user
    if (otherUser && $rootScope.user.id !== otherUser.id) {
        $scope.viewingSomeoneElse = true;
        $scope.user = otherUser;
        return;
    }

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
        {id: 'he', name: $translate.instant('LANG.HE')},
        {id: 'en', name: $translate.instant('LANG.EN')}
    ];
    $scope.settings = {language: $rootScope.user.ui_lang ? $rootScope.user.ui_lang : ''};

    $scope.canSaveSettings = () => $scope.settings.language;

    $scope.saveSettings = () => {
        let lang = $scope.settings.language;
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        localStorage.setItem('uiLang', lang);
        User.updateUser({ui_lang: lang}).then(() => {
            let body = angular.element('body');
            if (lang === 'he' && !body.hasClass('rtl')) {
                body.addClass('rtl');
            } else if (lang !== 'he') {
                body.removeClass('rtl');
            }
            $translate.use(lang);
            $rootScope.uiLang = lang;
            $ionicLoading.hide();
        });
    };
});