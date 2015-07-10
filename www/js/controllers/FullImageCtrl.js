angular.module('afterclass.controllers').controller('FullImageCtrl', function ($scope, $state, $stateParams) {
    $scope.img_id = $stateParams.img_id;
});