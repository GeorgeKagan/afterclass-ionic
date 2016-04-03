angular.module('afterclass.controllers').controller('ContactCtrl', ($scope, AppConfig) => {
    $scope.config = AppConfig.getConfig().contact;
});