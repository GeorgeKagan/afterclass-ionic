angular.module('afterclass.controllers').controller('ProfileCtrl', (
    $rootScope, $scope, $ionicTabsDelegate, $ionicPopup, $translate, $ionicLoading, $timeout, MyFirebase, User, otherUser, AppConfig) => {

    // If viewing someone else and that someone is not the session user
    if (otherUser && $rootScope.user.id !== otherUser.id) {
        $scope.viewingSomeoneElse = true;
        $scope.user = otherUser;
        return;
    }

    let ref = MyFirebase.getRef();

    $ionicTabsDelegate.select(0);

    // PROFILE

    if ($rootScope.user.is_teacher) {
        $scope.$watch('user.target_institutes', () => {
            $scope.targetGrades = [];
            _.map($rootScope.user.target_institutes, item => $scope.targetGrades = $scope.targetGrades.concat(Object.keys(item)));
            $scope.targetGrades = _.uniq($scope.targetGrades);
        });
    } else {

    }

    // CHANGE PASSWORD

    $scope.account = {oldPassword: '', newPassword: ''};
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
                console.log('Password changed successfully');
            } else {
                $ionicPopup.alert({
                    title   : $translate.instant('ERROR'),
                    template: $translate.instant('FORM.BAD_OLD_PW'),
                    okText  : $translate.instant('OK')
                });
                console.log('Error changing password: ', error);
            }
            $ionicLoading.hide();
        });
    };

    // SETTINGS

    let buildLangArr = () => {
        $scope.languages = [
            {id: 'he', name: $translate.instant('LANG.HE')},
            {id: 'en', name: $translate.instant('LANG.EN')}
        ];
    };
    buildLangArr();

    $scope.canSaveSettings = () => $scope.settings.language;
    $scope.settings = {
        language: $rootScope.user.ui_lang ? $rootScope.user.ui_lang : $translate.use()
    };

    // Pre-fill form + init collection by user type
    if ($rootScope.user.is_teacher) {

    } else {
        $scope.settings.grade = $rootScope.user.institute;
        AppConfig.loadConfig().then(() => $scope.grades = AppConfig.getConfig().grades);
    }

    $scope.saveSettings = () => {
        let lang = $scope.settings.language,
            payload = {ui_lang: lang};

        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        localStorage.setItem('uiLang', lang);

        // Set payload by user type
        if ($rootScope.user.is_teacher) {

        } else {
            payload.institute = $scope.settings.grade;
        }

        User.updateUser(payload).then(() => {
            // Change current UI lang real-time
            let body = angular.element('body');
            if (lang === 'he' && !body.hasClass('rtl')) {
                body.addClass('rtl');
            } else if (lang !== 'he') {
                body.removeClass('rtl');
            }
            $translate.use(lang);
            moment.locale(lang);
            $rootScope.uiLang = lang;
            $timeout(() => buildLangArr(), 100);
            //
            $ionicLoading.hide();
        });
    };
});