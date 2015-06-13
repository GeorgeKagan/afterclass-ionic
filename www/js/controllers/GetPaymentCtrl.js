angular.module('afterclass.controllers').controller('GetPaymentCtrl', function ($rootScope, $scope, $timeout, $state, $ionicLoading, Payment) {
    Payment.getPayments().then(function (data) {
        $scope.payment = data;
    });

    $scope.withdraw = function () {
        var balance = $scope.payment.balance;
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        $timeout(function () {
            Payment.withdraw($scope.payment.balanceFbId).then(function () {
                $ionicLoading.hide();
                $('#gp-balance').slideUp(function() {
                    $scope.$apply(function () {
                        $scope.payment.balance = 0;
                    });
                    $(this).slideDown(function () {
                        angular.element('.list li:first-child').addClass('highlight-new');
                        $timeout(function() {
                            angular.element('.list li:first-child').removeClass('highlight-new');
                        }, 3000);
                    });
                });
            });
        }, 1000);
    };

    $scope.backToHome = function () {
        $state.go('home');
    };

    //Payment._debugCreatePayment();
});