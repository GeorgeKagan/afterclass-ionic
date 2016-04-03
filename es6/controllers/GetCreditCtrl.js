angular.module('afterclass.controllers').controller('GetCreditCtrl', ($rootScope, $scope, $state, $ionicHistory, User, PayPal) => {
    if ($rootScope.user.is_teacher) {
        return false;
    }

    $scope.addCredit = (questionCount, paymentAmount) => {
        let updateUserCredits = () => {
            User.updateUser({credits: $rootScope.user.credits + questionCount});
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
        };

        // If desktop - just add credits
        if (!window.PayPalMobile) {
            return updateUserCredits();
        }

        // Pay with PayPal
        PayPal.initPaymentUI().then(() => PayPal.makePayment(paymentAmount, `${questionCount} questions`).then(updateUserCredits));
    };
});