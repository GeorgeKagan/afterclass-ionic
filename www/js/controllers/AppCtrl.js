angular.module('afterclass.controllers').controller('AppCtrl', function ($scope, $rootScope, $ionicPopover, $state, $ionicHistory, MyFirebase) {
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