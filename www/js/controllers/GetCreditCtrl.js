angular.module('afterclass.controllers').controller('GetCreditCtrl', function ($rootScope, $scope, $state, $ionicHistory, UserCollection, PaypalService) {
    if ($rootScope.user.is_teacher) {
        return false;
    }
    $scope.addCredit = function (questionCount, paymentAmount) {
        // Pay with paypal
        PaypalService.initPaymentUI().then(function () {
            PaypalService.makePayment(paymentAmount, questionCount + ' questions').then(function () {
                UserCollection.updateUser({
                    credits: questionCount
                });
                $state.go('home');
                $ionicHistory.nextViewOptions({disableBack: true});
            })
        });
    };
    $scope.backToHome = function () {
        $state.go('home');
    };
});