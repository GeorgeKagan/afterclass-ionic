angular.module('afterclass.controllers').controller('ViewQuestionCtrl', (
    $rootScope, $scope, $timeout, $ionicScrollDelegate, $state, $stateParams, $firebaseObject, $firebaseArray,
    $translate, $cordovaNetwork, $q, Post, PostReply, MyFirebase, Rating) => {
    'use strict';

    let post    = MyFirebase.getRef().child('/posts/' + $stateParams.firebase_id),
        replies = $firebaseArray(post.child('replies'));

    $scope.post               = $firebaseObject(post);
    $scope.replyState         = {replyBody: '', addImgPreview: '', addImgUrl: '', shouldShowAgreement: true};
    $scope.report             = {content: '', customMessage: ''};
    $scope.showReplyForm      = false;
    $scope.showAcceptQuestion = false;

    // Init functions
    $q.all([$scope.post.$loaded(), replies.$loaded()]).then(() => initRating(replies).then(() => initFooter($scope.post)));
    $timeout(() => $state.current.name === 'viewPost' && $ionicScrollDelegate.scrollBottom(true), 500);

    function initFooter(post) {
        $scope.isTeacher = $rootScope.user.is_teacher;

        if ($scope.isTeacher) {
            $scope.showRating = false; //Student only

            // Teacher - Show accept button for assigned teachers
            let acceptingTeachers = _.filter(post.potential_tutors, {post_status: 'accepted'});

            if ($scope.isTeacher && post.status === 'assigned' && acceptingTeachers.length === 0) {
                $scope.showReplyForm      = false;
                $scope.showAcceptQuestion = true;
            } else {
                $scope.showReplyForm      = true;
                $scope.showAcceptQuestion = false;
            }
        } else {
            $scope.showAcceptQuestion = false; // Teacher only

            if($scope.rating.hasRepliesToRate()) {
                $scope.showRating    = true;
                $scope.showReplyForm = false;
            } else {
                $scope.showRating    = false;
                $scope.showReplyForm = true;
            }
        }
    }
    function initRating(replies) {
        $scope.rating = Rating.getInstance(replies);

        if ($scope.rating.getRating() === 0) {
            $scope.allowReply = true;
        }
        $scope.rateAnswer = function(stars) {
            $scope.rating.rate(stars);
            if (stars <= 3) {
                Post.reportConversation($scope.post, $scope.report, post, $translate.instant('RATING.RATING_TOO_LOW'));
            }
        };
        return $scope.rating.loaded;
    }

    $scope.toggleReply = () => {
        if ($scope.showRating) {
            //Hide rating, show comment
            $scope.showRating    = false;
            $scope.showReplyForm = true;
        } else {
            //Hide comment, show rating
            $scope.showRating    = true;
            $scope.showReplyForm = false;
        }
    };
    $scope.acceptQuestion = () => {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert('Please check that you are connected to the internet');
        }
        Post.toggleAcceptance($stateParams.firebase_id, $rootScope.user.uid);
        $scope.showReplyForm      = true;
        $scope.showAcceptQuestion = false;
    };
    $scope.viewFullImage      = imgId => $state.go('fullImage', {img_id: imgId});
    $scope.addImage           = () => PostReply.showStudentAgreement(() => PostReply.imageUpload($scope.replyState), replies, $scope.replyState);
    $scope.addReply           = () => PostReply.addReply(replies, $scope.replyState, $scope.post);
    $scope.reportConversation = () => Post.reportConversation($scope.post, $scope.report, post, $translate.instant('RATING.RATING_TOO_LOW'));
    $scope.showAgreement      = () => PostReply.showStudentAgreement(() => angular.element('#commentInput').focus(), replies, $scope.replyState);
});