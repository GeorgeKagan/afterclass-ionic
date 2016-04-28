angular.module('afterclass.controllers').controller('HomeCtrl', (
    $rootScope, $scope, $ionicScrollDelegate, $state, $firebaseArray, $ionicPopup, $translate, $cordovaNetwork, Post, MyFirebase, InstitutePopup, User, Dom) => {
    'use strict';

    // If for some reason student doesn't have grade selected, prompt him to choose
    if (!$rootScope.user.is_teacher && !$rootScope.user.institute) {
        InstitutePopup.show();
    }

    // Load all user's questions from firebase
    let ref = MyFirebase.getRef().child('posts'),
        sync, sync3, posts, posts_tutor_answered;

    // Teacher home
    if ($rootScope.user.is_teacher) {
        // Unanswered posts for tutor (status = unanswered and local filter [if in potential tutors array])
        // TODO: HIGHLY UN-SCALABLE (THINK OF A WAY TO FETCH ONLY IF IN POTENTIAL TUTORS)
        $scope.posts_tutor_unanswered = $firebaseArray(ref);
        $scope.ifPotentialTutor = post => {
            // If post accepted by teacher and not by current teacher, exclude post
            if (post.acceptedBy && post.acceptedBy !== $rootScope.user.uid) { return false; }
            let tutor_ids = [];
            if (post.potential_tutors) {
                _.each(post.potential_tutors, (item, id) => tutor_ids.push(id));
            }
            // If current teacher present in potential teachers
            return angular.element.inArray($rootScope.user.uid, tutor_ids) > -1;
        };
        // Answered posts by tutor (last_tutor_id = this tutor's id)
        sync3                = ref.orderByChild('last_tutor_id').equalTo($rootScope.user.uid);
        posts_tutor_answered = $firebaseArray(sync3);
        posts_tutor_answered.$loaded().then(() => $scope.posts_tutor_answered = posts_tutor_answered);
    }
    // Student home
    else {
        sync  = ref.orderByChild('user').equalTo($rootScope.user.uid);
        posts = $firebaseArray(sync);
        posts.$loaded().then(() => $scope.posts = posts);
        $scope.ifUserUnanswered = post => post.status === 'unanswered' || post.status === 'assigned';
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