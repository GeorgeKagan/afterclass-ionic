angular.module('afterclass.controllers').controller('OnBoardingCtrl', ($scope, $state, $ionicHistory, $cordovaPush, $ionicSlideBoxDelegate, $log) => {
    'use strict';

    $scope.next = () => {
        $ionicSlideBoxDelegate.next();
    };

    $scope.finish = () => {
        //$ionicSlideBoxDelegate.previous();
        localStorage.setItem('finished_on_boarding', true);
        $ionicHistory.nextViewOptions({disableBack: true});
        $state.go('login');
    };
});
