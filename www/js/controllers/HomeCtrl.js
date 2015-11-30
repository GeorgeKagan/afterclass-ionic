angular.module('afterclass.controllers').controller('HomeCtrl', function (
    $rootScope, $scope, $ionicScrollDelegate, $ionicTabsDelegate, $state, $firebaseArray, $ionicPopup, $translate, $cordovaNetwork, Post, MyFirebase, InstitutePopup, User) {
    'use strict';

    // Debug student choose insitute popup
    //InstitutePopup.show();
    
    // Load all user's questions from firebase
    var ref = MyFirebase.getRef().child('posts'),
        sync, sync2, sync3, posts, posts_tutor_unanswered, posts_tutor_answered,
		tabs_top_pos = $rootScope.user.is_teacher && ionic.Platform.isIOS() ? 260 : 230;

    // Teacher home
    if ($rootScope.user.is_teacher) {
        // Unanswered posts for tutor (status = unanswered and local filter [if in potential tutors array])
        // TODO: HIGHLY UN-SCALABLE (THINK OF A WAY TO FETCH ONLY IF IN POTENTIAL TUTORS)
        $scope.posts_tutor_unanswered = $firebaseArray(ref);
        $scope.ifPotentialTutor = function (post) {
            if (post.acceptedBy && post.acceptedBy !== $rootScope.user.uid) {
                return false;
            }
            var tutor_ids = [];
            if (post.potential_tutors) {
                _.each(post.potential_tutors, function (item, id) {
                    tutor_ids.push(id);
                });
            }
            return angular.element.inArray($rootScope.user.uid, tutor_ids) > -1;
        };
        // Answered posts by tutor (last_tutor_id = this tutor's id)
        sync3                   = ref.orderByChild('last_tutor_id').equalTo($rootScope.user.uid);
        posts_tutor_answered    = $firebaseArray(sync3);
        posts_tutor_answered.$loaded().then(function () {
            $scope.posts_tutor_answered = posts_tutor_answered;
        });
    }
    // Student home
    else {
        sync    = ref.orderByChild('user').equalTo($rootScope.user.uid);
        posts   = $firebaseArray(sync);
        posts.$loaded().then(function () {
            $scope.posts = posts;
        });
        $scope.ifUserUnanswered = function (post) {
            return post.status === 'unanswered' || post.status === 'assigned';
        };
    }

    $scope.viewPost = function (firebase_id) {
        $state.go('viewPost', {firebase_id: firebase_id});
    };

    $scope.deletePost = function ($event, firebase_id) {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert('Please check that you are connected to the internet');
        }
        var confirmPopup = $ionicPopup.confirm({
            title       : $translate.instant('FORM.DEL_Q'),
            template    : $translate.instant('FORM.SURE'),
            cancelText  : $translate.instant('CANCEL'),
            okText      : $translate.instant('DELETE')
        });
        confirmPopup.then(function(res) {
            if (res) {
                Post.delete(firebase_id);
                User.updateUser({credits: $rootScope.user.credits + 1});
            }
        });
        $event.stopPropagation();
    };

    $scope.toggleAcceptance = function (firebase_id) {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert('Please check that you are connected to the internet');
        }
        Post.toggleAcceptance(firebase_id, $rootScope.user.uid);
    };

    $scope.getHeaderSize = function() {
        if (ionic.Platform.isIOS()) {
            return 64;
        } else {
            return 44;
        }
    };

    var tabs = angular.element('#ac-tabs-inner > .tabs');
    $scope.gotScrolled = function () {
        var y = angular.element('.scroll:visible').offset().top;
        if (y <= -186) {
            // Tabs sticky on top
            angular.element('.bar-header').addClass('scrolled');
            tabs.css('top', $scope.getHeaderSize());
        } else {
            // Tabs following scroll
            angular.element('.bar-header').removeClass('scrolled');
            tabs.css('top', tabs_top_pos - Math.abs(y));
        }
    };

    $scope.scrollToTop = function () {
        localStorage.setItem('home_selected_tab', $ionicTabsDelegate.selectedIndex());
        $ionicScrollDelegate.scrollTop(true);
        angular.element('#ac-tabs-inner .tabs').css('top', tabs_top_pos);
        return true;
    };
});