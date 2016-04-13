angular.module('afterclass.controllers').controller('GetPaymentCtrl', ($rootScope, $scope, $timeout, $ionicLoading, $ionicPopup, $translate, $cordovaNetwork, Payment) => {
    if (!$rootScope.user.is_teacher) {
        return false;
    }

    $scope.PaymentService = Payment;

    Payment.getPayments().then(data => $scope.payment = data);

    /* DEBUG FEATURE*/
    //Payment._debugCreatePayment();
});