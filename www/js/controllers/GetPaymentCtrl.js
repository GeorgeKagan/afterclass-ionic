angular.module('afterclass.controllers').controller('GetPaymentCtrl', function ($rootScope, $scope, $timeout, $state, $ionicLoading, $translate) {
    $scope.payment = {
        balance: 99,
        previous: [
            {amount: 100, status_code: 'pending', status: $translate.instant('STATUS.PENDING')},
            {amount: 80, status_code: 'paid', status: $translate.instant('STATUS.PAID')}
        ]
    };
    $scope.withdraw = function () {
        var balance = $scope.payment.balance;
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        $timeout(function () {
            $ionicLoading.hide();
            $('#gp-balance').slideUp(function() {
                $scope.$apply(function () {
                    $scope.payment.balance = 0;
                });
                $(this).slideDown(function () {
                    $scope.$apply(function () {
                        $scope.payment.previous.unshift({
                            amount: balance,
                            status_code: 'pending',
                            status: $translate.instant('STATUS.PENDING')
                        });
                    });
                    $timeout(function() {
                        angular.element('.list li:first-child').hide().slideDown(1000);
                    });
                });
            });
        }, 1500);
    };
    $scope.backToHome = function () {
        $state.go('home');
    };
});