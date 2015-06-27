angular.module('afterclass.controllers').controller('GetCreditCtrl', function ($rootScope, $scope, $state, $ionicHistory, UserCollection) {
    if ($rootScope.user.is_teacher) {
        return false;
    }
    $scope.addCredit = function (amount) {
        UserCollection.updateUser({
            credits: amount
        });
        $state.go('home');
        $ionicHistory.nextViewOptions({disableBack: true});
    };
    $scope.backToHome = function () {
        $state.go('home');
    };
});