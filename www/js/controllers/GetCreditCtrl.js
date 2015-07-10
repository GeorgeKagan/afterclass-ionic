angular.module('afterclass.controllers').controller('GetCreditCtrl', function ($rootScope, $scope, $state, $ionicHistory, User, Paypal) {
    if ($rootScope.user.is_teacher) {
        return false;
    }
    $scope.addCredit = function (questionCount, paymentAmount) {
        var updateUserCredits = function () {
            User.updateUser({
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
        Paypal.initPaymentUI().then(function () {
            Paypal.makePayment(paymentAmount, questionCount + ' questions').then(updateUserCredits)
        });
    };
});