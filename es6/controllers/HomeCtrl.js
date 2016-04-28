angular.module('afterclass.controllers').controller('HomeCtrl', (
    $rootScope, $scope, $ionicScrollDelegate, $state, $ionicPopup, $translate, $cordovaNetwork, Post, InstitutePopup, User, Dom, PostsFetcher) => {
    'use strict';

    // If for some reason student doesn't have grade selected, prompt him to choose
    if (!$rootScope.user.is_teacher && !$rootScope.user.institute) {
        InstitutePopup.show();
    }

    if ($rootScope.user.is_teacher) {
        PostsFetcher.getForTeacher($scope);
        $scope.ifPotentialTutor = PostsFetcher.ifPotentialTutor;
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
                Post.delete(firebase_id).then(() => $ionicScrollDelegate.scrollTop(false));
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

    $scope.homepageScrolled = Dom.homepageTabs.gotScrolled;
    $scope.scrollToTop      = Dom.homepageTabs.scrollToTop;
});