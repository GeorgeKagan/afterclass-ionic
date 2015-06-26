angular.module('afterclass.controllers').controller('GetCreditCtrl', function ($rootScope, $scope, $state) {
    if ($rootScope.user.is_teacher) {
        return false;
    }
    $scope.backToHome = function () {
        $state.go('home');
    };
});