angular.module('afterclass.controllers').controller('HomeCtrl', (
    $rootScope, $scope, $ionicScrollDelegate, $state, $ionicPopup, $translate, $cordovaNetwork, Post, InstitutePopup, User, Dom, PostsFetcher) => {
    'use strict';

    // If for some reason student doesn't have grade selected, prompt him to choose
    if (!$rootScope.user.is_teacher && !$rootScope.user.institute) {
        InstitutePopup.show();
    }

    if ($rootScope.user.is_teacher) {
        PostsFetcher.getForTeacher($scope);
        $scope.ifPotentialTeacher = PostsFetcher.ifPotentialTeacher;
    } else {
        PostsFetcher.getForStudent($scope);
        $scope.ifUserUnanswered = PostsFetcher.ifUserUnanswered;
    }

    $scope.viewPost = firebase_id => $state.go('viewPost', {firebase_id});

    $scope.deletePost = ($event, firebase_id) => {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert($translate.instant('CHECK_INTERNET'));
        }
        let confirmPopup = $ionicPopup.confirm({
            title       : $translate.instant('FORM.DEL_Q'),
            template    : $translate.instant('FORM.SURE'),
            cancelText  : $translate.instant('CANCEL'),
            okText      : $translate.instant('DELETE')
        });
        confirmPopup.then(function(res) {
            if (res) {
                Post.delete(firebase_id).then(() => $ionicScrollDelegate.resize());
                User.updateUser({credits: $rootScope.user.credits + 1});
            }
        });
        $event.stopPropagation();
    };

    $scope.toggleAcceptance = firebase_id => {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert($translate.instant('CHECK_INTERNET'));
        }
        Post.toggleAcceptance(firebase_id, $rootScope.user.uid);
    };

    $scope.showMessageBox = () => {
        if(typeof $rootScope.user !== 'undefined' && typeof $rootScope.user.create_date !== 'undefined') {
            var now = new Date();
            return $rootScope.user.create_date < now.setDate(now.getDate() - 1);
        } else {
            return false;
        }
    };

    $scope.homepageScrolled = Dom.homepageTabs.gotScrolled;
    $scope.scrollToTop      = Dom.homepageTabs.scrollToTop;

    $scope.$on('$ionicView.enter', () => {
        Dom.homepageTabs.gotScrolled();
    });
});