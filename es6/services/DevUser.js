angular.module('afterclass.services').factory('DevUser', ($rootScope, $timeout, $window, $state, $ionicLoading, User, InstitutePopup) => {
    'use strict';

    let devUsers = [
            '1591285834446649',  // AfterClass facebook
            '1518736295015643',  // Vitaly
            '10205593403011749', // Gosha
            '10206625622492055', // Katya
            '10205364847174667', // Gitlin
            '10153250113479854', // Sunshine
            '10152843702557886', // Arik
            '104530943234576'    // Helen Denth
        ];

    let DevUser = {};

    DevUser.addDevActionsIfDevUser = () => {
        let isDevUser = localStorage.getItem('isDevUser') === 'true',
            env       = localStorage.getItem('env');

        if (!$rootScope.user.id) {
            throw new Error('User has no ID. ' + JSON.stringify($rootScope.user));
        }
        else if (isDevUser || _.indexOf(devUsers, $rootScope.user.id) > -1) {
            localStorage.setItem('isDevUser', true);
            $rootScope.isDevUser = true;

            // Switch Firebase env
            $rootScope.switchFirebaseEnv = $event => {
                localStorage.setItem('env', env === 'dev' ? 'prod' : 'dev');
                $rootScope.logout();
                $event.preventDefault();
                $timeout(() => $window.location.reload(true), 1000);
            };

            // Delete Firebase user
            $rootScope.deleteFirebaseUser = $event => {
                User.deleteUser();
                $rootScope.logout();
                $event.preventDefault();
                $timeout(() => $window.location.reload(true), 1000);
            };

            // Change Institution
            $rootScope.changeInstitution = $event => {
                if ($rootScope.user.is_teacher) {
                    $state.go('userWizard_teacherStep1', {isEdit: 1});
                } else {
                    $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
                    InstitutePopup.show();
                }
                $rootScope.hidePopover();
                $event.preventDefault();
            };

            // Impersonate
            $rootScope.impersonateUser = $event => {
                $state.go('impersonate');
                $rootScope.hidePopover();
                $event.preventDefault();
            };
        }
    };

    return DevUser;
});