angular.module('afterclass.controllers', []).controller('AppCtrl', ($scope, $rootScope, $ionicPopover, $state, Auth, Utils, DevUser, I18n) => {

    $rootScope.env    = localStorage.getItem('env');
    $rootScope.$state = $state;

    // Logout user
    $rootScope.logout = () => Auth.logout($scope.popover);

    // Act when user object is initialized
    $rootScope.$watch('user', () => {
        if (!$rootScope.user) { return; }

        I18n.initUserSelectedLanguage();
        DevUser.addDevActionsIfDevUser();
    });

    // In app back btn
    $scope.myGoBack = Utils.myGoBack;

    // Header bar popover
    $ionicPopover.fromTemplateUrl('templates/partials/popover.html', {scope: $scope})
        .then(popover => $scope.popover = popover);
    $rootScope.hidePopover = () => $scope.popover.hide();
    $rootScope.getPopoverHeight = Utils.getPopoverHeight;
});