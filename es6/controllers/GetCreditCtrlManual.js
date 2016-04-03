angular.module('afterclass.controllers').controller('GetCreditCtrl', ($scope, AppConfig) => {
    $scope.config = AppConfig.getConfig().payments;
});