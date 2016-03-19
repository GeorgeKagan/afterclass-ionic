angular.module('afterclass.controllers').controller('AppCtrl', function (
    $scope, $rootScope, $ionicPopover, $state, $ionicHistory, $window, $timeout, $ionicLoading, MyFirebase, User, InstitutePopup) {

    $rootScope.env = localStorage.getItem('env');
    $rootScope.$state = $state;

    // Logout user
    $scope.logout = function () {
        var ref = MyFirebase.getRef();
        facebookConnectPlugin.logout(function() {});
        ref.unauth();
        $ionicHistory.nextViewOptions({disableBack: true});
        $scope.popover.hide();
        $rootScope.user = null;
        $state.go('login');
        if (localStorage.getItem('isDevUser') === 'true') {
            localStorage.setItem('isImpersonating', false);
            window.location.reload(true);
        }
    };

    $rootScope.$watch('user', function () {
        if (!$rootScope.user) {
            return;
        }
        // Popover side menu
        $scope.links = [
            {sref: 'profile', text: 'PAGES.PROFILE.MENU'},
            {sref: 'about', text: 'PAGES.ABOUT.MENU'},
            {sref: 'contact', text: 'PAGES.CONTACT.MENU'}
        ];
        if ($rootScope.user.is_teacher !== undefined && !$rootScope.user.is_teacher) {
            $scope.links.push({sref: 'getCredit', text: 'GET_POINTS'});
        }
        // Add dev actions
        var devUsers = [
                '1591285834446649',
                '1518736295015643',
                '10205593403011749', // Gosha
                '10206625622492055', // Katya
                '10205364847174667', // Gitlin
                '10153250113479854', // Sunshine
                '10152843702557886', // Arik
                '10208031223882048', // Dor
                '104530943234576' // Helen Denth
            ],
            isDevUser = localStorage.getItem('isDevUser') === 'true',
            env = localStorage.getItem('env');

        if (!$rootScope.user.id) {
            throw new Error('User has no ID. ' + JSON.stringify($rootScope.user));
        }
        else if (isDevUser || _.indexOf(devUsers, $rootScope.user.id) > -1 || $rootScope.user.id.indexOf('6375') > -1) {
            localStorage.setItem('isDevUser', true);
            $rootScope.isDevUser = true;
            // Switch Firebase env
            $scope.links.push({onclick: function ($event) {
                localStorage.setItem('env', env === 'dev' ? 'prod' : 'dev');
                $scope.logout();
                $event.preventDefault();
                $timeout(function() { window.location.reload(true); }, 1000);
            }, sref: 'dummy', classes: 'red', text: 'Switch to Firebase ' + (env === 'dev' ? 'PROD' : 'DEV')});
            // Change Institution
            $scope.links.push({onclick: function ($event) {
                if ($rootScope.user.is_teacher) {
                    $state.go('userDetails_tutorStep1', {isEdit: 1});
                } else {
                    $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
                    InstitutePopup.show();
                }
                $scope.hidePopover();
                $event.preventDefault();
            }, sref: 'dummy', classes: 'red', text: 'Change Institution'});
            // Impersonate
            $scope.links.push({onclick: function ($event) {
                $state.go('impersonate');
                $scope.hidePopover();
                $event.preventDefault();
            }, sref: 'dummy', classes: 'red', text: 'Impersonate'});
        }
    });

    $scope.hidePopover = function() {
        $scope.popover.hide();
    };

    $scope.backToHome = function () {
        $window.history.back();
    };

    // Header bar popover
    $ionicPopover.fromTemplateUrl('templates/partials/popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });
});