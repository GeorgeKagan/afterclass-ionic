angular.module('afterclass.controllers').controller('AppCtrl', function ($scope, $rootScope, $ionicPopover, $state, $ionicHistory, $window, MyFirebase, User) {
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

    // Popover side menu
    $scope.links = [
        {sref: 'about', text: 'PAGES.ABOUT.MENU'},
        {sref: 'contact', text: 'PAGES.CONTACT.MENU'}
        //{sref: 'coupon', text: 'PAGES.COUPON.MENU'}
    ];
    User.getFromUsersCollection().then(function(user) {
        if (!user.is_teacher) {
            $scope.links.push({sref: 'getCredit', text: 'GET_POINTS'});
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