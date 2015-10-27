angular.module('afterclass.controllers').controller('AppCtrl', function ($scope, $rootScope, $ionicPopover, $state, $ionicHistory, $window, MyFirebase, User) {

    $rootScope.env = localStorage.getItem('env');

    // Logout user
    $scope.logout = function () {
        var ref = MyFirebase.getRef();
        facebookConnectPlugin.logout(function() {});
        ref.unauth();
        $ionicHistory.nextViewOptions({disableBack: true});
        $scope.popover.hide();
        $rootScope.user = null;
        $state.go('login');
    };

    $rootScope.$watch('user', function () {
        if (!$rootScope.user) {
            return;
        }
        // Popover side menu
        $scope.links = [
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
                '10208031223882048' // Dor
            ],
            env = localStorage.getItem('env');
        if (_.indexOf(devUsers, $rootScope.user.id) !== -1) {
            $rootScope.isDevUser = true;
            // Switch Firebase env
            $scope.links.push({onclick: function ($event) {
                localStorage.setItem('env', env === 'dev' ? 'prod' : 'dev');
                $scope.logout();
                $event.preventDefault();
                location.reload();
            }, sref: 'dummy', classes: 'red', text: 'Switch to Firebase ' + (env === 'dev' ? 'PROD' : 'DEV')});
            // Delete Firebase user
            $scope.links.push({onclick: function ($event) {
                User.deleteUser();
                $scope.logout();
                $event.preventDefault();
                location.reload();
            }, sref: 'dummy', classes: 'red', text: 'Delete Firebase User'});
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