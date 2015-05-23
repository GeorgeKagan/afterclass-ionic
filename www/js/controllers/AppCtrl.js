angular.module('afterclass.controllers').controller('AppCtrl', function ($scope, $rootScope, $ionicPopover, $state, $ionicHistory) {
    // Logout user
    $scope.logout = function () {
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com");
        facebookConnectPlugin.logout();
        ref.unauth();
        $state.go('login');
        $ionicHistory.nextViewOptions({disableBack: true});
        $scope.popover.hide();
        $rootScope.user = null;
    };
    $scope.hidePopover = function() {
        $scope.popover.hide();
    };
    // Header bar popover
    $ionicPopover.fromTemplateUrl('templates/partials/popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });
});