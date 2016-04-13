angular.module('afterclass.services').factory('InstitutePopup', ($rootScope, $http, $timeout, $ionicPopup, $translate, $ionicLoading, User, AppConfig) => {
    'use strict';
    let showPopup = () => {
        let scope = $rootScope.$new();

        /**
         * Listen to Firebase config collection update and rebuild the grades array.
         */
        let populatePopupScopeWithGrades = () => {
            scope.institutes = [];
            AppConfig.loadConfig().then(() => {
                AppConfig.getConfig().grades.forEach(item => scope.institutes.push({
                    key: item,
                    value: $translate.instant('GRADES.' + item)
                }));
            });
        };
        scope.$on('configUpdated', populatePopupScopeWithGrades);
        populatePopupScopeWithGrades();

        scope.hash            = {selInstitute: 0};
        scope.selectInstitute = () => {};

        $timeout(() => {
            $ionicPopup.show({
                templateUrl : 'templates/partials/institute-popup.html',
                scope       : scope,
                title       : $translate.instant('SEL_INSTITUTE'),
                buttons     : [{
                    text: '<span>' + $translate.instant('SAVE') + '</span>',
                    type: 'button-positive',
                    onTap: e => {
                        let institute = angular.element('#popup-institute :selected').val();
                        if (institute) {
                            User.updateUser({institute});
                        } else {
                            angular.element('#pi-err').show();
                            e.preventDefault();
                        }
                    }
                }]
            });
            $timeout(() => {
                // If already got data (edit mode), auto-fill the selects
                if ($rootScope.user.institute) {
                    angular.element(`#popup-institute [value="${$rootScope.user.institute}"]`).attr('selected', true);
                    scope.selectInstitute();
                }
            });
            $ionicLoading.hide();
        }, 500);
    };
    return {
        show: showPopup
    };
});