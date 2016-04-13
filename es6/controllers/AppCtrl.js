angular.module('afterclass.controllers', []).controller('AppCtrl', (
    $scope, $rootScope, $ionicPopover, $state, $ionicHistory, $window, $timeout, $ionicLoading, $translate, MyFirebase, User, InstitutePopup, Auth) => {

    $rootScope.env    = localStorage.getItem('env');
    $rootScope.$state = $state;

    // Logout user
    $scope.logout = () => Auth.logout($scope.popover);

    $rootScope.$watch('user', () => {
        if (!$rootScope.user) { return; }

        // If user changed language and local storage was cleared
        if ($rootScope.user.ui_lang && !localStorage.getItem(('uiLang'))) {
            localStorage.setItem('uiLang', $rootScope.user.ui_lang);
            $window.location.reload(true);
        }
        moment.locale($translate.use());
        $rootScope.uiLang = $translate.use();

        // Add dev actions
        let devUsers = [
                '1591285834446649',  // AfterClass facebook
                '1518736295015643',  // Vitaly
                '10205593403011749', // Gosha
                '10206625622492055', // Katya
                '10205364847174667', // Gitlin
                '10153250113479854', // Sunshine
                '10152843702557886', // Arik
                '104530943234576'    // Helen Denth
            ],
            isDevUser = localStorage.getItem('isDevUser') === 'true',
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
                $scope.logout();
                $event.preventDefault();
                $timeout(() => $window.location.reload(true), 1000);
            };

            // Delete Firebase user
            $rootScope.deleteFirebaseUser = $event => {
                User.deleteUser();
                $scope.logout();
                $event.preventDefault();
                $timeout(() => $window.location.reload(true), 1000);
            };

            // Change Institution
            $rootScope.changeInstitution = $event => {
                if ($rootScope.user.is_teacher) {
                    $state.go('userDetails_tutorStep1', {isEdit: 1});
                } else {
                    $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
                    InstitutePopup.show();
                }
                $scope.hidePopover();
                $event.preventDefault();
            };

            // Impersonate
            $rootScope.impersonateUser = $event => {
                $state.go('impersonate');
                $scope.hidePopover();
                $event.preventDefault();
            };
        }
    });

    // In app back btn

    $scope.backToHome = () => $window.history.back();

    $scope.myGoBack = () => {
        let wentBack = $ionicHistory.goBack();
        if (!wentBack) {
            $scope.backToHome();
        }
    };

    // Header bar popover

    $ionicPopover.fromTemplateUrl('templates/partials/popover.html', {
        scope: $scope
    }).then(popover => $scope.popover = popover);

    $rootScope.hidePopover = () => $scope.popover.hide();

    $rootScope.getPopoverHeight = () => {
        let itemCount = angular.element('ion-popover-view .list a').length + 1;
        return `popover-${itemCount}-items`;
    };
});