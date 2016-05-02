angular.module('afterclass.services').factory('Profile', ($rootScope, $ionicLoading, $ionicPopup, $translate, $log, $timeout, MyFirebase, User, AppConfig) => {
    'use strict';

    let Profile = {},
        ref     = MyFirebase.getRef();

    Profile.changePassword = accountData => {
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        ref.changePassword({
            email      : $rootScope.user.email,
            oldPassword: accountData.oldPassword,
            newPassword: accountData.newPassword
        }, error => {
            if (error === null) {
                accountData.oldPassword = '';
                accountData.newPassword = '';
                $ionicPopup.alert({
                    title   : $translate.instant('SUCCESS'),
                    template: $translate.instant('FORM.PW_CHANGED'),
                    okText  : $translate.instant('OK')
                });
                $log.log('Password changed successfully');
            } else {
                $ionicPopup.alert({
                    title   : $translate.instant('ERROR'),
                    template: $translate.instant('FORM.BAD_OLD_PW'),
                    okText  : $translate.instant('OK')
                });
                $log.log('Error changing password: ', error);
            }
            $ionicLoading.hide();
        });
    };

    Profile.saveSettings = settingsData => {
        let lang    = settingsData.language,
            payload = {ui_lang: lang};

        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        localStorage.setItem('uiLang', lang);

        // Set payload by user type
        if ($rootScope.user.is_teacher) {

        } else {
            payload.institute = settingsData.grade;
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
            $timeout(() => {
                Profile.buildLangArr();
                if ($rootScope.user.is_teacher) {

                } else {
                    Profile.buildGradesArr();
                }
            }, 100);
            //
            $ionicLoading.hide();
        });
    };

    Profile.buildLangArr =() => {
        return [
            {id: 'he', name: $translate.instant('LANG.HE')},
            {id: 'en', name: $translate.instant('LANG.EN')}
        ]
    };

    Profile.buildGradesArr = () => {
        let grades = [];
        AppConfig.loadConfig().then(() => {
            AppConfig.getConfig().grades.forEach(item => grades.push({id: item, name: $translate.instant('GRADES.' + item)}));
        });
        return grades;
    };
    
    Profile.buildTargetGradesArr = () => {
        let targetGrades = [];
        _.map($rootScope.user.target_institutes, item => targetGrades = targetGrades.concat(Object.keys(item)));
        targetGrades = _.uniq(targetGrades);
        return targetGrades;
    };

    return Profile
});