angular.module('afterclass.controllers', []).controller('AppCtrl', ($scope, $rootScope, $ionicPopover, $state, Auth, Utils, DevUser, I18n) => {

    $rootScope.env    = localStorage.getItem('env') || 'prod';
    $rootScope.$state = $state;

    // Logout user
    $rootScope.logout = () => Auth.logout($scope.popover);

    // Act when user object is initialized
    $rootScope.$watch('user', () => {
        if (!$rootScope.user) { return; }

        I18n.initUserSelectedLanguage();
        DevUser.addDevActionsIfDevUser();
    });

    // Header bar popover
    $ionicPopover.fromTemplateUrl('templates/partials/popover.html', {scope: $scope})
        .then(popover => $scope.popover = popover);
    $rootScope.hidePopover = () => $scope.popover.hide();
    $rootScope.getPopoverHeight = Utils.getPopoverHeight;
});