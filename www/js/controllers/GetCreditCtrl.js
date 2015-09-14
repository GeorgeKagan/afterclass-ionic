angular.module('afterclass.controllers').controller('GetCreditCtrl', function ($rootScope, $scope, $state, $ionicHistory, User, PayPal) {
    if ($rootScope.user.is_teacher) {
        return false;
    }
    $scope.addCredit = function (questionCount, paymentAmount) {
        var updateUserCredits = function () {
            User.updateUser({
                credits: $rootScope.user.credits + questionCount
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
        PayPal.initPaymentUI().then(function () {
            PayPal.makePayment(paymentAmount, questionCount + ' questions').then(updateUserCredits)
        });
    };
});