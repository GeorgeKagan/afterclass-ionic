angular.module('afterclass.services').factory('I18n', ($rootScope, $window, $translate) => {
    'use strict';
    
    let I18n = {};

    I18n.initUserSelectedLanguage = () => {
        // If user changed language and local storage was cleared
        if ($rootScope.user.ui_lang && !localStorage.getItem(('uiLang'))) {
            localStorage.setItem('uiLang', $rootScope.user.ui_lang);
            $window.location.reload(true);
        }
        moment.locale($translate.use());
        $rootScope.uiLang = $translate.use();
    };

    return I18n;
});