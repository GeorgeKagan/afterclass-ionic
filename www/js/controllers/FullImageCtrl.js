angular.module('afterclass.controllers').controller('FullImageCtrl', function ($scope, $state, $stateParams, $window) {
    $scope.img_id = $stateParams.img_id;
    $scope.backToHome = function () {
        $window.history.back();
    };
});