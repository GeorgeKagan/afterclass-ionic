angular.module('afterclass.controllers').controller('GetPaymentCtrl', function ($rootScope, $scope, $state) {
    $scope.backToHome = function () {
        $state.go('home');
    };
});