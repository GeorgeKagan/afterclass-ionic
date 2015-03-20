angular.module('afterclass.controllers').controller('AppCtrl', function ($scope, $rootScope, $ionicPopover, $state, $ionicHistory) {
    // Logout user
    $scope.logout = function () {
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com");
        ref.unauth();
        $state.go('login');
        $ionicHistory.nextViewOptions({disableBack: true});
        $scope.popover.hide();
        $rootScope.user = null;
    };
    // Header bar popover
    $ionicPopover.fromTemplateUrl('templates/popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });
});