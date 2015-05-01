angular.module('afterclass.controllers').controller('OnBoardingCtrl', function ($scope, $state, $ionicHistory, $ionicSlideBoxDelegate, UserCollection, InstitutePopup) {
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