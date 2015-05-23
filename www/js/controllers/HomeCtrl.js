angular.module('afterclass.controllers').controller('HomeCtrl', function (user, $rootScope, $scope, $ionicScrollDelegate, $state,
                                                                          $firebaseArray, $ionicLoading, $cordovaDialogs, Post) {
    'use strict';
    var tabs_top_pos = $rootScope.user.is_teacher ? 44 : 230;
    // Load all user's questions from firebase
    var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com/posts"),
        sync, sync2, sync3, posts, posts_tutor_unanswered, posts_tutor_answered;
    if ($rootScope.user.is_teacher) {
        // Unanswered posts for tutor (status = unanswered and local filter [if in potential tutors array])
        // TODO: HIGHLY UN-SCALABLE (THINK OF A WAY TO FETCH ONLY IF IN POTENTIAL TUTORS)
        sync2 = ref.orderByChild('status').equalTo('assigned');
        posts_tutor_unanswered = $firebaseArray(sync2);
        posts_tutor_unanswered.$loaded().then(function () {
            $scope.posts_tutor_unanswered = posts_tutor_unanswered;
        });
        $scope.ifPotentialTutor = function (post) {
            var tutor_ids = post.potential_tutors ? post.potential_tutors.map(function(item) {
                return item.ticked ? item.id : 0;
            }) : [];
            return angular.element.inArray($rootScope.user.id, tutor_ids) > -1;
        };
        // Answered posts by tutor (last_tutor_id = this tutor's id)
        sync3 = ref.orderByChild('last_tutor_id').equalTo($rootScope.user.id);
        posts_tutor_answered = $firebaseArray(sync3);
        posts_tutor_answered.$loaded().then(function () {
            $scope.posts_tutor_answered = posts_tutor_answered;
        });
    } else {
        sync = ref.orderByChild('user').equalTo($rootScope.user.id);
        posts = $firebaseArray(sync);
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
        $cordovaDialogs.confirm('Are you sure?', 'Delete question', ['Delete', 'Cancel']).then(function(buttonIndex) {
            if (buttonIndex == 1) {
                Post.delete(firebase_id);
            }
        });
        $event.stopPropagation();
    };
    $scope.postReply = function () {
        $cordovaDialogs.alert('No action yet...', 'Post reply', 'OK');
    };
    //$scope.postAccept = function (post) {
    //    sync.$update(post.$id, { status: 'answered' }).then(function() {
    //        $ionicScrollDelegate.scrollTop(true);
    //    });
    //};
    //$scope.postDecline = function (post) {
    //    sync.$update(post.$id, { status: 'unanswered' }).then(function() {
    //        $ionicScrollDelegate.scrollTop(true);
    //    });
    //};
    $scope.gotScrolled = function () {
        if ($rootScope.user.is_teacher) {
            return;
        }
        var y = angular.element('.scroll:visible').offset().top;
        if (y <= -186) {
            angular.element('.bar-header').addClass('scrolled');
            angular.element('#ac-tabs-inner .tabs').css('top', 44);
        } else {
            angular.element('.bar-header').removeClass('scrolled');
            angular.element('#ac-tabs-inner .tabs').css('top', tabs_top_pos - Math.abs(y));
        }
    };
    $scope.scrollToTop = function () {
        $ionicScrollDelegate.scrollTop();
        angular.element('#ac-tabs-inner .tabs').css('top', tabs_top_pos);
        return true;
    };
});