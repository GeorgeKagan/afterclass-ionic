angular.module('afterclass.controllers').controller('GetCreditCtrl', function ($rootScope, $scope, $state, $ionicHistory, UserCollection, PaypalService) {
    if ($rootScope.user.is_teacher) {
        return false;
    }
    $scope.addCredit = function (questionCount, paymentAmount) {
        var updateUserCredits = function () {
            UserCollection.updateUser({
                credits: questionCount
            });
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
        };
        // If desktop - just add credits
        if (!window.PayPalMobile) {
            updateUserCredits();
            return;
        }
        // Pay with paypal
        PaypalService.initPaymentUI().then(function () {
            PaypalService.makePayment(paymentAmount, questionCount + ' questions').then(updateUserCredits)
        });
    };
    $scope.backToHome = function () {
        $state.go('home');
    };
});