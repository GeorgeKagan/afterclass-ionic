angular.module('afterclass.controllers').controller('OnBoardingCtrl', function ($scope, $state, $ionicHistory, $ionicSlideBoxDelegate) {
    'use strict';
    $scope.next = function() {
        $ionicSlideBoxDelegate.next();
    };
    $scope.finish = function() {
        localStorage.setItem('finished_on_boarding', true);
        $ionicHistory.nextViewOptions({disableBack: true});
        $state.go('login');
    };
});