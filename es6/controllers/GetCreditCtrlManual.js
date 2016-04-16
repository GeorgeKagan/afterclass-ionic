angular.module('afterclass.controllers').controller('GetCreditCtrl', ($scope, AppConfig) => {
    $scope.config = AppConfig.getConfig().payments;

    //Translation objects
    $scope.monthlyPrice = {
        price: $scope.config.monthly_price
    };

    $scope.onetimePrice = {
        price: $scope.config.one_time_price
    };

});