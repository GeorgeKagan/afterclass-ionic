angular.module('afterclass.controllers').controller('GetCreditCtrl', function ($rootScope, $scope, $state, $ionicHistory, User, AppConfig) {

    $scope.config = AppConfig.getConfig().payments;

});